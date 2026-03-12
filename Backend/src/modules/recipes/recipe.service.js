import { GoogleGenAI } from "@google/genai";
import Recipe from "./recipe.model.js";
import Ingredient from "../ingredients/ingredient.model.js";
import MenuItem from "../menu/menuItem.model.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";
import { emitOutletEvent } from "../../realtime/realtime.manager.js";
import AppError from "../../shared/errors/AppError.js";
import env from "../../config/env.js";

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

async function invalidateRecipeCache(tenant, menuItemId = null) {
  try {
    const redis = getRedisClient();
    const listKey = buildTenantKey("recipes", tenant);
    await redis.del(listKey);
    if (menuItemId) {
      const itemKey = buildTenantKey(`recipe:${menuItemId}`, tenant);
      await redis.del(itemKey);
    }
  } catch (_) {
    // Redis failure is non-fatal
  }
}

export async function createRecipe(data, tenant) {
  const existing = await Recipe.findOne({
    menuItemId: data.menuItemId,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  });

  if (existing) {
    throw new AppError(
      "A recipe for this menu item already exists. Delete the existing recipe to create a new one.",
      409,
      "RECIPE_DUPLICATE"
    );
  }

  // Validate all ingredientIds belong to the same outlet
  const ingredientIds = (data.ingredients || []).map((i) => i.ingredientId);
  if (ingredientIds.length > 0) {
    const foundCount = await Ingredient.countDocuments({
      _id: { $in: ingredientIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    });
    if (foundCount !== ingredientIds.length) {
      throw new AppError(
        "One or more ingredient IDs are invalid or do not belong to this outlet",
        400,
        "INVALID_INGREDIENT_IDS"
      );
    }
  }

  const recipe = await Recipe.create({
    menuItemId: data.menuItemId,
    ingredients: data.ingredients || [],
    prepTime: data.prepTime ?? 0,
    instructions: data.instructions ?? "",
    aiGenerated: data.aiGenerated ?? false,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });

  await invalidateRecipeCache(tenant, data.menuItemId);
  emitOutletEvent(tenant.outletId, "recipe:updated", {
    type: "RECIPE_CREATE",
    recipeId: String(recipe._id),
    menuItemId: String(data.menuItemId),
  });
  return recipe;
}

export async function getRecipes(tenant, { cursor, limit, search, aiOnly } = {}) {
  const pageLimit = toBoundedLimit(limit);

  const tenantFilter = {
    franchiseId: tenant.franchiseId,
    isDeleted: false,
  };
  if (tenant.outletId) tenantFilter.outletId = tenant.outletId;

  // Resolve menu item IDs for search
  let searchMenuItemIds = null;
  if (search?.trim()) {
    const matchingItems = await MenuItem.find({
      franchiseId: tenant.franchiseId,
      isDeleted: false,
      name: { $regex: search.trim(), $options: "i" },
      ...(tenant.outletId ? { outletId: tenant.outletId } : {}),
    }).select("_id").lean();
    searchMenuItemIds = matchingItems.map((m) => m._id);
  }

  const baseFilter = { ...tenantFilter };
  if (searchMenuItemIds !== null) baseFilter.menuItemId = { $in: searchMenuItemIds };
  if (aiOnly === "true" || aiOnly === true) baseFilter.aiGenerated = true;

  const queryFilter = { ...baseFilter };
  const decodedCursor = decodeCursor(cursor);

  if (decodedCursor) {
    queryFilter.$or = [
      { createdAt: { $lt: decodedCursor.createdAt } },
      { createdAt: decodedCursor.createdAt, _id: { $lt: decodedCursor._id } },
    ];
  }

  const [itemsPlusOne, totalMatching, totalRecipes, aiGeneratedCount] = await Promise.all([
    Recipe.find(queryFilter)
      .populate("menuItemId", "name price categoryId")
      .populate("ingredients.ingredientId", "name unit currentStock")
      .sort({ createdAt: -1, _id: -1 })
      .limit(pageLimit + 1)
      .lean(),
    Recipe.countDocuments(baseFilter),
    Recipe.countDocuments(tenantFilter),
    Recipe.countDocuments({ ...tenantFilter, aiGenerated: true }),
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
      stats: { totalRecipes, aiGeneratedCount },
    },
  };
}

export async function getRecipeById(id, tenant) {
  const recipe = await Recipe.findOne({
    _id: id,
    franchiseId: tenant.franchiseId,
    isDeleted: false,
    ...(tenant.outletId ? { outletId: tenant.outletId } : {}),
  })
    .populate("menuItemId", "name price categoryId")
    .populate("ingredients.ingredientId", "name unit currentStock")
    .lean();

  if (!recipe) {
    throw new AppError("Recipe not found", 404, "RECIPE_NOT_FOUND");
  }

  return recipe;
}

/**
 * Used by the order handler — result is cached per menuItemId.
 * Returns null when no recipe is configured (fall back to MenuItem stock).
 */
export async function getRecipeByMenuItemId(menuItemId, tenant) {
  try {
    const redis = getRedisClient();
    const cacheKey = buildTenantKey(`recipe:${menuItemId}`, tenant);
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const recipe = await Recipe.findOne({
      menuItemId,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    }).lean();

    const value = recipe || null;
    await redis.set(cacheKey, JSON.stringify(value), "EX", CACHE_TTL);
    return value;
  } catch (_) {
    // Redis failure — go straight to DB
    return Recipe.findOne({
      menuItemId,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    }).lean();
  }
}

export async function updateRecipe(id, data, tenant) {
  const allowedFields = ["ingredients", "prepTime", "instructions", "aiGenerated"];
  const update = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) update[field] = data[field];
  }

  // Validate new ingredient IDs if provided
  if (update.ingredients && update.ingredients.length > 0) {
    const ingredientIds = update.ingredients.map((i) => i.ingredientId);
    const foundCount = await Ingredient.countDocuments({
      _id: { $in: ingredientIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    });
    if (foundCount !== ingredientIds.length) {
      throw new AppError(
        "One or more ingredient IDs are invalid or do not belong to this outlet",
        400,
        "INVALID_INGREDIENT_IDS"
      );
    }
  }

  const recipe = await Recipe.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { $set: update },
    { new: true, runValidators: true }
  )
    .populate("menuItemId", "name price categoryId")
    .populate("ingredients.ingredientId", "name unit currentStock");

  if (!recipe) {
    throw new AppError("Recipe not found", 404, "RECIPE_NOT_FOUND");
  }

  await invalidateRecipeCache(tenant, String(recipe.menuItemId?._id || recipe.menuItemId));
  emitOutletEvent(tenant.outletId, "recipe:updated", {
    type: "RECIPE_UPDATE",
    recipeId: String(recipe._id),
    menuItemId: String(recipe.menuItemId?._id || recipe.menuItemId),
  });
  return recipe;
}

export async function deleteRecipe(id, tenant) {
  const recipe = await Recipe.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { $set: { isDeleted: true } },
    { new: true }
  );

  if (!recipe) {
    throw new AppError("Recipe not found", 404, "RECIPE_NOT_FOUND");
  }

  await invalidateRecipeCache(tenant, String(recipe.menuItemId));
  emitOutletEvent(tenant.outletId, "recipe:updated", {
    type: "RECIPE_DELETE",
    recipeId: String(recipe._id),
    menuItemId: String(recipe.menuItemId),
  });
  return { deleted: true, id };
}

/**
 * Calls OpenAI to generate a structured recipe JSON.
 * Does NOT persist to the database — frontend reviews and calls createRecipe.
 */
export async function generateRecipeWithAI(description) {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(
      "AI recipe generation is not configured (missing GEMINI_API_KEY)",
      503,
      "AI_NOT_CONFIGURED"
    );
  }

  const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

  const prompt = `You are a professional chef assistant.
When given a dish description, respond ONLY with a valid JSON object matching this exact schema:
{
  "name": "string — dish name",
  "ingredients": [
    { "name": "string", "quantity": number, "unit": "gram|ml|piece" }
  ],
  "instructions": "string — step-by-step cooking instructions",
  "prepTime": number — preparation time in minutes
}
Do not include any text outside the JSON object.

Generate a recipe for: ${description}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const raw = response.text;
  if (!raw) {
    throw new AppError("AI returned an empty response", 502, "AI_EMPTY_RESPONSE");
  }

  let parsed;
  try {
    // Strip markdown code fences Gemini sometimes wraps around JSON
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AppError("AI returned invalid JSON", 502, "AI_INVALID_JSON");
  }

  // Normalise unit values to allowed enum
  const unitMap = { g: "gram", grams: "gram", gram: "gram", ml: "ml", milliliter: "ml", milliliters: "ml", piece: "piece", pieces: "piece", pcs: "piece", nos: "piece" };
  if (Array.isArray(parsed.ingredients)) {
    parsed.ingredients = parsed.ingredients.map((ing) => ({
      ...ing,
      unit: unitMap[ing.unit?.toLowerCase()] ?? "piece",
    }));
  }

  return parsed;
}
