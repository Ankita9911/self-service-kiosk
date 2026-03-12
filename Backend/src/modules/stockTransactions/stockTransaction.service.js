import StockTransaction from "./stockTransaction.model.js";
import Ingredient from "../ingredients/ingredient.model.js";
import { emitOutletEvent } from "../../realtime/realtime.manager.js";
import AppError from "../../shared/errors/AppError.js";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toBoundedLimit(value) {
  const parsed = Number.parseInt(String(value ?? DEFAULT_LIMIT), 10);
  if (Number.isNaN(parsed)) return DEFAULT_LIMIT;
  return Math.min(Math.max(parsed, 1), MAX_LIMIT);
}

function encodeCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
    if (!decoded?.createdAt || !decoded?._id) return null;
    const createdAt = new Date(decoded.createdAt);
    if (Number.isNaN(createdAt.getTime())) return null;
    return { createdAt, _id: decoded._id };
  } catch {
    return null;
  }
}

/**
 * Internal utility — creates a StockTransaction document inside an optional Mongo session.
 * Called by order.handler.js after ingredient stock is already deducted.
 */
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
    session ? { session } : {}
  );
  return transaction;
}

/**
 * Bulk variant — creates multiple StockTransactions in one call (used by order handler).
 */
export async function logTransactionsBulk(transactions, { tenant, session = null } = {}) {
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

/**
 * Manual stock entry (PURCHASE, WASTAGE, ADJUSTMENT) from the API.
 * Also updates Ingredient.currentStock.
 */
export async function createManualTransaction(data, tenant) {
  const { ingredientId, type, quantity, note } = data;

  if (!["PURCHASE", "WASTAGE", "ADJUSTMENT"].includes(type)) {
    throw new AppError(
      "Manual transactions only support PURCHASE, WASTAGE, or ADJUSTMENT",
      400,
      "INVALID_TRANSACTION_TYPE"
    );
  }

  if (typeof quantity !== "number" || quantity === 0) {
    throw new AppError("quantity must be a non-zero number", 400, "INVALID_QUANTITY");
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

  // For WASTAGE, quantity must be positive (it represents how much was wasted)
  // We'll store it as negative delta for currentStock
  let stockDelta;
  if (type === "PURCHASE") {
    stockDelta = Math.abs(quantity);
  } else if (type === "WASTAGE") {
    stockDelta = -Math.abs(quantity);
  } else {
    // ADJUSTMENT — quantity can be positive or negative directly
    stockDelta = quantity;
  }

  if (ingredient.currentStock + stockDelta < 0) {
    throw new AppError(
      `Insufficient stock. Current: ${ingredient.currentStock}, adjustment would result in negative stock`,
      400,
      "INSUFFICIENT_STOCK"
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

export async function getTransactions(tenant, { ingredientId, type, cursor, limit } = {}) {
  const pageLimit = toBoundedLimit(limit);

  const baseFilter = {
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  };

  if (ingredientId) baseFilter.ingredientId = ingredientId;
  if (type) baseFilter.type = type;

  const queryFilter = { ...baseFilter };
  const decodedCursor = decodeCursor(cursor);

  if (decodedCursor) {
    queryFilter.$or = [
      { createdAt: { $lt: decodedCursor.createdAt } },
      { createdAt: decodedCursor.createdAt, _id: { $lt: decodedCursor._id } },
    ];
  }

  const [itemsPlusOne, totalMatching] = await Promise.all([
    StockTransaction.find(queryFilter)
      .populate("ingredientId", "name unit")
      .sort({ createdAt: -1, _id: -1 })
      .limit(pageLimit + 1)
      .lean(),
    StockTransaction.countDocuments(baseFilter),
  ]);

  const hasNext = itemsPlusOne.length > pageLimit;
  const items = hasNext ? itemsPlusOne.slice(0, pageLimit) : itemsPlusOne;

  const nextCursor =
    hasNext
      ? encodeCursor({
          createdAt: items[items.length - 1].createdAt,
          _id: items[items.length - 1]._id,
        })
      : null;

  return {
    items,
    meta: {
      pagination: { limit: pageLimit, hasNext, nextCursor, totalMatching },
    },
  };
}

export async function getTransactionsByIngredient(ingredientId, tenant, queryOptions) {
  return getTransactions(tenant, { ...queryOptions, ingredientId });
}
