import Ingredient from "./ingredient.model.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";
import { emitOutletEvent } from "../../realtime/realtime.manager.js";
import AppError from "../../shared/errors/AppError.js";

const CACHE_TTL = 300;
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

async function invalidateIngredientCache(tenant) {
  try {
    const redis = getRedisClient();
    const cacheKey = buildTenantKey("ingredients", tenant);
    await redis.del(cacheKey);
  } catch (_) {
    // Redis failure is non-fatal
  }
}

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
  emitOutletEvent(tenant.outletId, "ingredient:updated", {
    type: "INGREDIENT_CREATE",
    ingredientId: String(ingredient._id),
  });
  emitOutletEvent(tenant.outletId, "inventory:updated", {
    type: "INGREDIENT_CREATE",
    ingredientId: String(ingredient._id),
  });
  return ingredient;
}

export async function getIngredients(tenant, { search, unit, lowStock, cursor, limit } = {}) {
  const pageLimit = toBoundedLimit(limit);

  // Base tenant filter — always applied
  const tenantFilter = {
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  };

  // Build search/filter constraints for the paginated query
  const baseFilter = { ...tenantFilter };
  if (unit && unit !== "ALL") baseFilter.unit = unit;
  if (search?.trim()) baseFilter.name = { $regex: search.trim(), $options: "i" };
  if (lowStock === "true" || lowStock === true) {
    baseFilter.$expr = { $lt: ["$currentStock", "$minThreshold"] };
  }

  const queryFilter = { ...baseFilter };
  const decodedCursor = decodeCursor(cursor);

  if (decodedCursor) {
    queryFilter.$or = [
      { createdAt: { $lt: decodedCursor.createdAt } },
      { createdAt: decodedCursor.createdAt, _id: { $lt: decodedCursor._id } },
    ];
  }

  const [itemsPlusOne, totalMatching, totalItems, lowStockItems] = await Promise.all([
    Ingredient.find(queryFilter)
      .sort({ createdAt: -1, _id: -1 })
      .limit(pageLimit + 1)
      .lean(),
    Ingredient.countDocuments(baseFilter),
    // Stats always use the raw tenant filter (no search/lowStock)
    Ingredient.countDocuments(tenantFilter),
    Ingredient.countDocuments({
      ...tenantFilter,
      $expr: { $lt: ["$currentStock", "$minThreshold"] },
    }),
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
      pagination: {
        limit: pageLimit,
        hasNext,
        nextCursor,
        totalMatching,
      },
      stats: {
        totalItems,
        lowStockItems,
      },
    },
  };
}

export async function getIngredientById(id, tenant) {
  const ingredient = await Ingredient.findOne({
    _id: id,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
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
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404, "INGREDIENT_NOT_FOUND");
  }

  await invalidateIngredientCache(tenant);
  emitOutletEvent(tenant.outletId, "ingredient:updated", {
    type: "INGREDIENT_UPDATE",
    ingredientId: String(ingredient._id),
  });
  emitOutletEvent(tenant.outletId, "inventory:updated", {
    type: "INGREDIENT_UPDATE",
    ingredientId: String(ingredient._id),
  });
  return ingredient;
}

export async function deleteIngredient(id, tenant) {
  const ingredient = await Ingredient.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!ingredient) {
    throw new AppError("Ingredient not found", 404, "INGREDIENT_NOT_FOUND");
  }

  await invalidateIngredientCache(tenant);
  emitOutletEvent(tenant.outletId, "ingredient:updated", {
    type: "INGREDIENT_DELETE",
    ingredientId: String(ingredient._id),
  });
  emitOutletEvent(tenant.outletId, "inventory:updated", {
    type: "INGREDIENT_DELETE",
    ingredientId: String(ingredient._id),
  });
  return { deleted: true, id };
}

export async function adjustStock(id, { quantity, note }, tenant) {
  if (typeof quantity !== "number" || quantity === 0) {
    throw new AppError(
      "quantity must be a non-zero number",
      400,
      "INVALID_QUANTITY"
    );
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
  emitOutletEvent(tenant.outletId, "ingredient:updated", {
    type: "INGREDIENT_STOCK_ADJUST",
    ingredientId: String(ingredient._id),
  });
  emitOutletEvent(tenant.outletId, "inventory:updated", {
    type: "INGREDIENT_STOCK_ADJUST",
    ingredientId: String(ingredient._id),
  });
  return ingredient;
}
