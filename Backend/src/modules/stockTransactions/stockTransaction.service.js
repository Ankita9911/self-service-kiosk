import StockTransaction from "./stockTransaction.model.js";
import Ingredient from "../ingredients/model/ingredient.model.js";
import { emitOutletEvent } from "../../realtime/realtime.manager.js";
import AppError from "../../shared/errors/AppError.js";
import { toBoundedLimit } from "../../shared/utils/pagination.js";

const DEFAULT_LIMIT = 20;

const VALID_SORT_FIELDS = ["createdAt", "type", "quantity"];
const VALID_SORT_ORDERS = ["asc", "desc"];

function getSortConfig(sortBy, sortOrder) {
  const field = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
  const order = VALID_SORT_ORDERS.includes(sortOrder) ? sortOrder : "desc";
  const dir = order === "asc" ? 1 : -1;
  return { field, order, dir };
}

function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const decoded = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf-8"),
    );
    if (!decoded?._id) return null;
    return decoded;
  } catch {
    return null;
  }
}

function buildCursorCondition(decoded, field, dir) {
  if (!decoded) return null;
  const { _id } = decoded;

  if (field === "createdAt") {
    const dateVal = decoded.createdAt ? new Date(decoded.createdAt) : null;
    if (!dateVal || Number.isNaN(dateVal.getTime())) return null;
    if (dir === -1) {
      return {
        $or: [
          { createdAt: { $lt: dateVal } },
          { createdAt: dateVal, _id: { $lt: _id } },
        ],
      };
    }
    return {
      $or: [
        { createdAt: { $gt: dateVal } },
        { createdAt: dateVal, _id: { $gt: _id } },
      ],
    };
  }

  const { sortVal } = decoded;
  if (sortVal === undefined || sortVal === null) return null;
  if (dir === -1) {
    return {
      $or: [
        { [field]: { $lt: sortVal } },
        { [field]: sortVal, _id: { $lt: _id } },
      ],
    };
  }
  return {
    $or: [
      { [field]: { $gt: sortVal } },
      { [field]: sortVal, _id: { $gt: _id } },
    ],
  };
}

export async function logTransaction({
  ingredientId,
  type,
  quantity,
  referenceType,
  referenceId = null,
  note = "",
  tenant,
  session = null,
}) {
  const doc = {
    ingredientId,
    type,
    quantity,
    referenceType,
    referenceId,
    note,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  };

  const [transaction] = await StockTransaction.create(
    [doc],
    session ? { session } : {},
  );
  return transaction;
}

export async function logTransactionsBulk(
  transactions,
  { tenant, session = null } = {},
) {
  const docs = transactions.map((t) => ({
    ingredientId: t.ingredientId,
    type: t.type,
    quantity: t.quantity,
    referenceType: t.referenceType,
    referenceId: t.referenceId ?? null,
    note: t.note ?? "",
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  }));

  return StockTransaction.insertMany(docs, session ? { session } : {});
}

export async function createManualTransaction(data, tenant) {
  const { ingredientId, type, quantity, note } = data;

  if (!["PURCHASE", "WASTAGE", "ADJUSTMENT"].includes(type)) {
    throw new AppError(
      "Manual transactions only support PURCHASE, WASTAGE, or ADJUSTMENT",
      400,
      "INVALID_TRANSACTION_TYPE",
    );
  }

  const ingredient = await Ingredient.findOne({
    _id: ingredientId,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  });

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404, "INGREDIENT_NOT_FOUND");
  }

  let stockDelta;
  if (type === "PURCHASE") {
    stockDelta = Math.abs(quantity);
  } else if (type === "WASTAGE") {
    stockDelta = -Math.abs(quantity);
  } else {
    stockDelta = quantity;
  }

  if (ingredient.currentStock + stockDelta < 0) {
    throw new AppError(
      `Insufficient stock. Current: ${ingredient.currentStock}, adjustment would result in negative stock`,
      400,
      "INSUFFICIENT_STOCK",
    );
  }

  await Ingredient.findByIdAndUpdate(ingredientId, {
    $inc: { currentStock: stockDelta },
  });

  const transaction = await StockTransaction.create({
    ingredientId,
    type,
    quantity: stockDelta,
    referenceType: "MANUAL",
    note: note ?? "",
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });

  emitOutletEvent(tenant.outletId, "stock-transactions:updated", {
    type: "MANUAL_TRANSACTION_CREATE",
    transactionId: String(transaction._id),
    ingredientId: String(ingredientId),
  });
  emitOutletEvent(tenant.outletId, "inventory:updated", {
    type: "MANUAL_TRANSACTION_CREATE",
    transactionId: String(transaction._id),
    ingredientId: String(ingredientId),
  });

  return transaction;
}

export async function getTransactions(
  tenant,
  { ingredientId, type, search, cursor, limit, sortBy, sortOrder } = {},
) {
  const pageLimit = toBoundedLimit(limit, DEFAULT_LIMIT);
  const { field, dir } = getSortConfig(sortBy, sortOrder);

  const tenantFilter = { franchiseId: tenant.franchiseId };
  if (tenant.outletId) tenantFilter.outletId = tenant.outletId;

  const baseFilter = { ...tenantFilter };

  if (ingredientId) {
    baseFilter.ingredientId = ingredientId;
  } else if (search?.trim()) {
    const matchingIngredients = await Ingredient.find({
      franchiseId: tenant.franchiseId,
      isDeleted: false,
      name: { $regex: search.trim(), $options: "i" },
      ...(tenant.outletId ? { outletId: tenant.outletId } : {}),
    })
      .select("_id")
      .lean();
    baseFilter.ingredientId = { $in: matchingIngredients.map((i) => i._id) };
  }

  if (type) baseFilter.type = type;

  const queryFilter = { ...baseFilter };
  const decoded = decodeCursor(cursor);
  const cursorCondition = buildCursorCondition(decoded, field, dir);
  if (cursorCondition) {
    queryFilter.$or = cursorCondition.$or;
  }

  const sortSpec = { [field]: dir, _id: dir === -1 ? -1 : 1 };

  const [
    itemsPlusOne,
    totalMatching,
    totalTransactions,
    purchaseCount,
    consumptionCount,
    wastageCount,
    adjustmentCount,
  ] = await Promise.all([
    StockTransaction.find(queryFilter)
      .populate("ingredientId", "name unit")
      .sort(sortSpec)
      .limit(pageLimit + 1)
      .lean(),
    StockTransaction.countDocuments(baseFilter),
    StockTransaction.countDocuments(tenantFilter),
    StockTransaction.countDocuments({ ...tenantFilter, type: "PURCHASE" }),
    StockTransaction.countDocuments({ ...tenantFilter, type: "CONSUMPTION" }),
    StockTransaction.countDocuments({ ...tenantFilter, type: "WASTAGE" }),
    StockTransaction.countDocuments({ ...tenantFilter, type: "ADJUSTMENT" }),
  ]);

  const hasNext = itemsPlusOne.length > pageLimit;
  const items = hasNext ? itemsPlusOne.slice(0, pageLimit) : itemsPlusOne;

  const lastItem = items[items.length - 1];
  const nextCursor =
    hasNext && lastItem
      ? encodeCursor(
          field === "createdAt"
            ? { createdAt: lastItem.createdAt, _id: lastItem._id }
            : { sortVal: lastItem[field], _id: lastItem._id },
        )
      : null;

  return {
    items,
    meta: {
      pagination: { limit: pageLimit, hasNext, nextCursor, totalMatching },
      stats: {
        totalTransactions,
        purchaseCount,
        consumptionCount,
        wastageCount,
        adjustmentCount,
      },
    },
  };
}

export async function getTransactionsByIngredient(
  ingredientId,
  tenant,
  queryOptions,
) {
  return getTransactions(tenant, { ...queryOptions, ingredientId });
}
