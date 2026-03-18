import StockTransaction from "../model/stockTransaction.model.js";
import Ingredient from "../../ingredients/model/ingredient.model.js";
import MenuItem from "../../menu/model/menuItem.model.js";
import { emitOutletEvent } from "../../../realtime/realtime.manager.js";
import AppError from "../../../shared/errors/AppError.js";
import { toBoundedLimit } from "../../../shared/utils/pagination.js";
import { SOURCE_TYPE } from "../constant/stockTransaction.constants.js";

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
  menuItemId = null,
  sourceType = SOURCE_TYPE.INGREDIENT,
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
    menuItemId,
    sourceType,
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
    menuItemId: t.menuItemId ?? null,
    sourceType: t.sourceType ?? SOURCE_TYPE.INGREDIENT,
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
  const {
    sourceType = SOURCE_TYPE.INGREDIENT,
    itemId,
    ingredientId: legacyIngredientId,
    type,
    quantity,
    note,
  } = data;

  const resolvedItemId = itemId ?? legacyIngredientId;

  if (!["PURCHASE", "WASTAGE", "ADJUSTMENT"].includes(type)) {
    throw new AppError(
      "Manual transactions only support PURCHASE, WASTAGE, or ADJUSTMENT",
      400,
      "INVALID_TRANSACTION_TYPE",
    );
  }

  if (!resolvedItemId) {
    throw new AppError("itemId is required", 400, "ITEM_ID_REQUIRED");
  }

  let stockDelta;
  if (type === "PURCHASE") {
    stockDelta = Math.abs(quantity);
  } else if (type === "WASTAGE") {
    stockDelta = -Math.abs(quantity);
  } else {
    stockDelta = quantity;
  }

  let transaction;

  if (sourceType === SOURCE_TYPE.MENU_ITEM) {
    const menuItem = await MenuItem.findOne({
      _id: resolvedItemId,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    });

    if (!menuItem) {
      throw new AppError("Direct stock item not found", 404, "ITEM_NOT_FOUND");
    }

    if ((menuItem.inventoryMode ?? "RECIPE") !== "DIRECT") {
      throw new AppError(
        "Only DIRECT inventory items can be managed from stock transactions",
        400,
        "INVALID_INVENTORY_MODE",
      );
    }

    if (menuItem.stockQuantity + stockDelta < 0) {
      throw new AppError(
        `Insufficient stock. Current: ${menuItem.stockQuantity}, adjustment would result in negative stock`,
        400,
        "INSUFFICIENT_STOCK",
      );
    }

    await MenuItem.findByIdAndUpdate(resolvedItemId, {
      $inc: { stockQuantity: stockDelta },
    });

    transaction = await StockTransaction.create({
      menuItemId: resolvedItemId,
      sourceType: SOURCE_TYPE.MENU_ITEM,
      type,
      quantity: stockDelta,
      referenceType: "MANUAL",
      note: note ?? "",
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
    });
  } else {
    const ingredient = await Ingredient.findOne({
      _id: resolvedItemId,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    });

    if (!ingredient) {
      throw new AppError("Ingredient not found", 404, "INGREDIENT_NOT_FOUND");
    }

    if (ingredient.currentStock + stockDelta < 0) {
      throw new AppError(
        `Insufficient stock. Current: ${ingredient.currentStock}, adjustment would result in negative stock`,
        400,
        "INSUFFICIENT_STOCK",
      );
    }

    await Ingredient.findByIdAndUpdate(resolvedItemId, {
      $inc: { currentStock: stockDelta },
    });

    transaction = await StockTransaction.create({
      ingredientId: resolvedItemId,
      sourceType: SOURCE_TYPE.INGREDIENT,
      type,
      quantity: stockDelta,
      referenceType: "MANUAL",
      note: note ?? "",
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
    });
  }

  emitOutletEvent(tenant.outletId, "stock-transactions:updated", {
    type: "MANUAL_TRANSACTION_CREATE",
    transactionId: String(transaction._id),
    itemId: String(resolvedItemId),
  });
  emitOutletEvent(tenant.outletId, "inventory:updated", {
    type: "MANUAL_TRANSACTION_CREATE",
    transactionId: String(transaction._id),
    itemId: String(resolvedItemId),
  });

  return transaction;
}

export async function getTransactions(
  tenant,
  {
    ingredientId,
    itemId,
    sourceType,
    type,
    search,
    cursor,
    limit,
    sortBy,
    sortOrder,
  } = {},
) {
  const pageLimit = toBoundedLimit(limit, DEFAULT_LIMIT);
  const { field, dir } = getSortConfig(sortBy, sortOrder);

  const tenantFilter = { franchiseId: tenant.franchiseId };
  if (tenant.outletId) tenantFilter.outletId = tenant.outletId;

  const baseFilter = { ...tenantFilter };

  const normalizedSourceType =
    typeof sourceType === "string" ? sourceType.trim().toUpperCase() : "";

  if (
    normalizedSourceType &&
    Object.values(SOURCE_TYPE).includes(normalizedSourceType)
  ) {
    baseFilter.sourceType = normalizedSourceType;
    if (normalizedSourceType === SOURCE_TYPE.MENU_ITEM) {
      baseFilter.menuItemId = { $ne: null };
    }
    if (normalizedSourceType === SOURCE_TYPE.INGREDIENT) {
      baseFilter.ingredientId = { $ne: null };
    }
  }

  if (itemId) {
    if (baseFilter.sourceType === SOURCE_TYPE.MENU_ITEM) {
      baseFilter.menuItemId = itemId;
    } else if (baseFilter.sourceType === SOURCE_TYPE.INGREDIENT) {
      baseFilter.ingredientId = itemId;
    } else {
      baseFilter.$or = [{ ingredientId: itemId }, { menuItemId: itemId }];
    }
  } else if (ingredientId) {
    baseFilter.ingredientId = ingredientId;
  } else if (search?.trim()) {
    const [matchingIngredients, matchingItems] = await Promise.all([
      Ingredient.find({
        franchiseId: tenant.franchiseId,
        isDeleted: false,
        name: { $regex: search.trim(), $options: "i" },
        ...(tenant.outletId ? { outletId: tenant.outletId } : {}),
      })
        .select("_id")
        .lean(),
      MenuItem.find({
        franchiseId: tenant.franchiseId,
        isDeleted: false,
        name: { $regex: search.trim(), $options: "i" },
        ...(tenant.outletId ? { outletId: tenant.outletId } : {}),
      })
        .select("_id")
        .lean(),
    ]);

    const ingredientIds = matchingIngredients.map((i) => i._id);
    const menuItemIds = matchingItems.map((i) => i._id);

    if (baseFilter.sourceType === SOURCE_TYPE.INGREDIENT) {
      baseFilter.ingredientId = { $in: ingredientIds };
    } else if (baseFilter.sourceType === SOURCE_TYPE.MENU_ITEM) {
      baseFilter.menuItemId = { $in: menuItemIds };
    } else {
      baseFilter.$or = [
        { ingredientId: { $in: ingredientIds } },
        { menuItemId: { $in: menuItemIds } },
      ];
    }
  }

  if (type) baseFilter.type = type;

  const queryFilter = { ...baseFilter };
  const decoded = decodeCursor(cursor);
  const cursorCondition = buildCursorCondition(decoded, field, dir);
  if (cursorCondition) {
    if (queryFilter.$or) {
      const existingOr = queryFilter.$or;
      delete queryFilter.$or;
      queryFilter.$and = [{ $or: existingOr }, { $or: cursorCondition.$or }];
    } else {
      queryFilter.$or = cursorCondition.$or;
    }
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
      .populate("menuItemId", "name inventoryMode")
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
