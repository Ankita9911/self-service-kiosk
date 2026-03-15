import Ingredient from "./ingredient.model.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";
import { emitOutletEvent } from "../../realtime/realtime.manager.js";
import AppError from "../../shared/errors/AppError.js";
import { toBoundedLimit } from "../../shared/utils/pagination.js";

const CACHE_TTL = 300;
const DEFAULT_LIMIT = 20;

// ─── Private helpers ──────────────────────────────────────────────────────────

async function invalidateIngredientCache(tenant) {
  try {
    const redis = getRedisClient();
    await redis.del(buildTenantKey("ingredients", tenant));
  } catch {
    // Redis failure is non-fatal
  }
}

function buildSortSpec(sortBy, sortOrder) {
  const order = sortOrder === "asc" ? 1 : -1;
  const allowedFields = ["createdAt", "currentStock", "minThreshold", "name"];
  const field = allowedFields.includes(sortBy) ? sortBy : "createdAt";
  return { field, order };
}

// Ingredient list uses multi-field sort cursors — more complex than the standard
// createdAt cursor, so these helpers are ingredient-specific and stay here.
function encodeSortCursor(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodeSortCursor(cursor, sortField) {
  if (!cursor) return null;
  try {
    const decoded = JSON.parse(Buffer.from(cursor, "base64url").toString("utf-8"));
    if (!decoded?._id) return null;
    if (sortField === "createdAt") {
      if (!decoded.createdAt) return null;
      const createdAt = new Date(decoded.createdAt);
      if (Number.isNaN(createdAt.getTime())) return null;
      return { createdAt, _id: decoded._id };
    }
    if (decoded[sortField] === undefined) return null;
    return { [sortField]: decoded[sortField], _id: decoded._id };
  } catch {
    return null;
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function createIngredient(data, tenant) {
  const existing = await Ingredient.findOne({
    name: { $regex: `^${data.name.trim()}$`, $options: "i" },
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(
      `Ingredient "${data.name}" already exists for this outlet`,
      409,
      "INGREDIENT_DUPLICATE"
    );
  }

  const ingredient = await Ingredient.create({
    name: data.name.trim(),
    unit: data.unit,
    currentStock: data.currentStock ?? 0,
    minThreshold: data.minThreshold ?? 0,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });

  await invalidateIngredientCache(tenant);
  emitOutletEvent(tenant.outletId, "ingredient:updated", { type: "INGREDIENT_CREATE", ingredientId: String(ingredient._id) });
  emitOutletEvent(tenant.outletId, "inventory:updated", { type: "INGREDIENT_CREATE", ingredientId: String(ingredient._id) });
  return ingredient;
}

export async function getIngredients(tenant, { search, unit, lowStock, cursor, limit, sortBy, sortOrder } = {}) {
  const pageLimit = toBoundedLimit(limit, DEFAULT_LIMIT);
  const { field: sortField, order: sortOrderNum } = buildSortSpec(sortBy, sortOrder);

  const tenantFilter = { franchiseId: tenant.franchiseId, isDeleted: false };
  if (tenant.outletId) tenantFilter.outletId = tenant.outletId;

  const baseFilter = { ...tenantFilter };
  if (unit && unit !== "ALL") baseFilter.unit = unit;
  if (search?.trim()) baseFilter.name = { $regex: search.trim(), $options: "i" };
  if (lowStock === "true" || lowStock === true) {
    baseFilter.$expr = { $lt: ["$currentStock", "$minThreshold"] };
  }

  const queryFilter = { ...baseFilter };
  const decodedCursor = decodeSortCursor(cursor, sortField);

  if (decodedCursor) {
    const cursorVal = decodedCursor[sortField];
    if (sortField === "createdAt") {
      queryFilter.$or = [
        { createdAt: { $lt: decodedCursor.createdAt } },
        { createdAt: decodedCursor.createdAt, _id: { $lt: decodedCursor._id } },
      ];
    } else if (sortOrderNum === -1) {
      queryFilter.$or = [
        { [sortField]: { $lt: cursorVal } },
        { [sortField]: cursorVal, _id: { $lt: decodedCursor._id } },
      ];
    } else {
      queryFilter.$or = [
        { [sortField]: { $gt: cursorVal } },
        { [sortField]: cursorVal, _id: { $lt: decodedCursor._id } },
      ];
    }
  }

  const sortSpec = sortField === "createdAt"
    ? { createdAt: sortOrderNum, _id: -1 }
    : { [sortField]: sortOrderNum, _id: -1 };

  const [itemsPlusOne, totalMatching, totalItems, lowStockItems] = await Promise.all([
    Ingredient.find(queryFilter).sort(sortSpec).limit(pageLimit + 1).lean(),
    Ingredient.countDocuments(baseFilter),
    Ingredient.countDocuments(tenantFilter),
    Ingredient.countDocuments({ ...tenantFilter, $expr: { $lt: ["$currentStock", "$minThreshold"] } }),
  ]);

  const hasNext = itemsPlusOne.length > pageLimit;
  const items = hasNext ? itemsPlusOne.slice(0, pageLimit) : itemsPlusOne;

  const lastItem = items[items.length - 1];
  const nextCursor = hasNext && lastItem
    ? encodeSortCursor({ [sortField]: lastItem[sortField], _id: lastItem._id })
    : null;

  return {
    items,
    meta: {
      pagination: { limit: pageLimit, hasNext, nextCursor, totalMatching },
      stats: { totalItems, lowStockItems },
    },
  };
}

export async function getIngredientById(id, tenant) {
  const ingredient = await Ingredient.findOne({
    _id: id,
    franchiseId: tenant.franchiseId,
    isDeleted: false,
    ...(tenant.outletId ? { outletId: tenant.outletId } : {}),
  }).lean();

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404, "INGREDIENT_NOT_FOUND");
  }

  return ingredient;
}

export async function updateIngredient(id, data, tenant) {
  const allowedFields = ["name", "unit", "minThreshold"];
  const update = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) update[field] = data[field];
  }

  const ingredient = await Ingredient.findOneAndUpdate(
    { _id: id, franchiseId: tenant.franchiseId, outletId: tenant.outletId, isDeleted: false },
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404, "INGREDIENT_NOT_FOUND");
  }

  await invalidateIngredientCache(tenant);
  emitOutletEvent(tenant.outletId, "ingredient:updated", { type: "INGREDIENT_UPDATE", ingredientId: String(ingredient._id) });
  emitOutletEvent(tenant.outletId, "inventory:updated", { type: "INGREDIENT_UPDATE", ingredientId: String(ingredient._id) });
  return ingredient;
}

export async function deleteIngredient(id, tenant) {
  const ingredient = await Ingredient.findOneAndUpdate(
    { _id: id, franchiseId: tenant.franchiseId, outletId: tenant.outletId, isDeleted: false },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404, "INGREDIENT_NOT_FOUND");
  }

  await invalidateIngredientCache(tenant);
  emitOutletEvent(tenant.outletId, "ingredient:updated", { type: "INGREDIENT_DELETE", ingredientId: String(ingredient._id) });
  emitOutletEvent(tenant.outletId, "inventory:updated", { type: "INGREDIENT_DELETE", ingredientId: String(ingredient._id) });
  return { deleted: true, id };
}

export async function adjustStock(id, { quantity, note }, tenant) {
  if (typeof quantity !== "number" || quantity === 0) {
    throw new AppError("quantity must be a non-zero number", 400, "INVALID_QUANTITY");
  }

  const ingredient = await Ingredient.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
      ...(quantity < 0 ? { currentStock: { $gte: Math.abs(quantity) } } : {}),
    },
    { $inc: { currentStock: quantity } },
    { new: true }
  );

  if (!ingredient) {
    throw new AppError(
      "Ingredient not found or insufficient stock for deduction",
      404,
      "INGREDIENT_ADJUST_FAILED"
    );
  }

  await invalidateIngredientCache(tenant);
  emitOutletEvent(tenant.outletId, "ingredient:updated", { type: "INGREDIENT_STOCK_ADJUST", ingredientId: String(ingredient._id) });
  emitOutletEvent(tenant.outletId, "inventory:updated", { type: "INGREDIENT_STOCK_ADJUST", ingredientId: String(ingredient._id) });
  return ingredient;
}
