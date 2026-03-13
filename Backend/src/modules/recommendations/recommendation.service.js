import mongoose from "mongoose";
import Order from "../orders/order.model.js";
import MenuItem from "../menu/menuItem.model.js";
import Combo from "../menu/combo.model.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";

const TTL = {
  TRENDING: 5 * 60,           // 5 minutes
  FREQUENTLY_BOUGHT: 30 * 60, // 30 minutes
  COMPLETE_MEAL: 10 * 60,     // 10 minutes
};

// ─── Cache helper (mirrors analytics.service.js pattern) ──────────────────────

async function withCache(key, ttl, fn) {
  let redis;
  try {
    redis = getRedisClient();
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch (_) {}

  const result = await fn();

  try {
    if (redis) await redis.setex(key, ttl, JSON.stringify(result));
  } catch (_) {}

  return result;
}

// ─── Strategy 1: Trending Now ─────────────────────────────────────────────────
// Top-selling items at this outlet in the last N hours, enriched with live menu data.

export async function getTrending(tenant, options = {}) {
  const { windowHours = 4, limit = 8 } = options;
  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);

  const cacheKey = buildTenantKey(
    `rec:trending:${windowHours}h:${limit}`,
    tenant
  );

  return withCache(cacheKey, TTL.TRENDING, async () => {
    // Aggregate orders in the time window, rank by quantity sold
    const soldItems = await Order.aggregate([
      {
        $match: {
          outletId,
          createdAt: { $gte: since },
          status: { $nin: ["CREATED"] }, // exclude abandoned/unpaid
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemId",
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.lineTotal" },
          nameSnapshot: { $first: "$items.nameSnapshot" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: limit * 2 }, // fetch extra to account for out-of-stock filtering below
    ]);

    if (soldItems.length === 0) return [];

    const itemIds = soldItems.map((s) => s._id);

    // Enrich with live menu data (price, stock, offers, image)
    const liveItems = await MenuItem.find({
      _id: { $in: itemIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
      isActive: true,
    })
      .select("_id name description imageUrl price stockQuantity offers categoryId serviceType")
      .lean();

    const liveMap = new Map(liveItems.map((item) => [String(item._id), item]));

    const enriched = soldItems
      .map((sold) => {
        const live = liveMap.get(String(sold._id));
        if (!live) return null; // item deleted or inactive — skip
        if (live.stockQuantity <= 0) return null; // out of stock — skip

        return {
          _id: live._id,
          name: live.name,
          description: live.description,
          imageUrl: live.imageUrl,
          price: live.price,
          stockQuantity: live.stockQuantity,
          offers: live.offers ?? [],
          categoryId: live.categoryId,
          serviceType: live.serviceType,
          totalSold: sold.totalSold,
          totalRevenue: sold.totalRevenue,
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    return enriched;
  });
}

// ─── Strategy 2: Frequently Bought Together ───────────────────────────────────
// Find items that co-occur most often with the given itemIds in the same order.

export async function getFrequentlyBoughtTogether(tenant, itemIds = [], options = {}) {
  const { limit = 5, windowDays = 30 } = options;

  if (!itemIds.length) return [];

  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  // Stable cache key regardless of itemIds order
  const sortedIds = [...itemIds].sort().join(",");
  const cacheKey = buildTenantKey(
    `rec:fbt:${sortedIds}:${windowDays}d`,
    tenant
  );

  return withCache(cacheKey, TTL.FREQUENTLY_BOUGHT, async () => {
    const seedIds = itemIds.map((id) => new mongoose.Types.ObjectId(id));

    // Find all orders that contain at least one of the seed items
    const coOrders = await Order.aggregate([
      {
        $match: {
          outletId,
          createdAt: { $gte: since },
          "items.itemId": { $in: seedIds },
        },
      },
      { $unwind: "$items" },
      {
        // Exclude the seed items themselves from suggestions
        $match: {
          "items.itemId": { $nin: seedIds },
        },
      },
      {
        $group: {
          _id: "$items.itemId",
          coOccurrenceCount: { $sum: 1 },
          nameSnapshot: { $first: "$items.nameSnapshot" },
        },
      },
      { $sort: { coOccurrenceCount: -1 } },
      { $limit: limit * 2 },
    ]);

    if (coOrders.length === 0) return [];

    const candidateIds = coOrders.map((c) => c._id);

    // Enrich with live menu data
    const liveItems = await MenuItem.find({
      _id: { $in: candidateIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
      isActive: true,
    })
      .select("_id name description imageUrl price stockQuantity offers categoryId serviceType")
      .lean();

    const liveMap = new Map(liveItems.map((item) => [String(item._id), item]));

    const enriched = coOrders
      .map((co) => {
        const live = liveMap.get(String(co._id));
        if (!live) return null;
        if (live.stockQuantity <= 0) return null;

        return {
          _id: live._id,
          name: live.name,
          description: live.description,
          imageUrl: live.imageUrl,
          price: live.price,
          stockQuantity: live.stockQuantity,
          offers: live.offers ?? [],
          categoryId: live.categoryId,
          serviceType: live.serviceType,
          coOccurrenceCount: co.coOccurrenceCount,
        };
      })
      .filter(Boolean)
      .slice(0, limit);

    return enriched;
  });
}

// ─── Strategy 3: Complete Your Meal ───────────────────────────────────────────
// Suggest items from categories not yet in the cart + flag matching combo deals.

export async function getCompleteMeal(tenant, cartItemIds = [], cartCategoryIds = [], options = {}) {
  const { limit = 4, windowDays = 30 } = options;

  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const sortedCatIds = [...cartCategoryIds].sort().join(",");
  const cacheKey = buildTenantKey(
    `rec:meal:${sortedCatIds}:${windowDays}d`,
    tenant
  );

  return withCache(cacheKey, TTL.COMPLETE_MEAL, async () => {
    // Find top-selling items from categories NOT already represented in the cart
    const popularFromOtherCategories = await Order.aggregate([
      {
        $match: {
          outletId,
          createdAt: { $gte: since },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 50 }, // broad pool to filter against categories
    ]);

    if (popularFromOtherCategories.length === 0) return { suggestions: [], comboDeal: null };

    const popularIds = popularFromOtherCategories.map((p) => p._id);

    // Fetch live items and filter to those outside existing cart categories
    const excludedCategoryIds = cartCategoryIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );
    const excludedItemIds = cartItemIds.map(
      (id) => new mongoose.Types.ObjectId(id)
    );

    const liveItems = await MenuItem.find({
      _id: { $in: popularIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
      isActive: true,
      stockQuantity: { $gt: 0 },
      ...(excludedCategoryIds.length > 0 && {
        categoryId: { $nin: excludedCategoryIds },
      }),
      ...(excludedItemIds.length > 0 && {
        _id: { $nin: excludedItemIds },
      }),
    })
      .select("_id name description imageUrl price stockQuantity offers categoryId serviceType")
      .lean();

    // Re-sort by original popularity order
    const popularRankMap = new Map(
      popularFromOtherCategories.map((p, idx) => [String(p._id), idx])
    );
    liveItems.sort(
      (a, b) =>
        (popularRankMap.get(String(a._id)) ?? 999) -
        (popularRankMap.get(String(b._id)) ?? 999)
    );

    const suggestions = liveItems.slice(0, limit).map((item) => ({
      _id: item._id,
      name: item.name,
      description: item.description,
      imageUrl: item.imageUrl,
      price: item.price,
      stockQuantity: item.stockQuantity,
      offers: item.offers ?? [],
      categoryId: item.categoryId,
      serviceType: item.serviceType,
    }));

    // Check if any active combo contains items already in the cart
    let comboDeal = null;
    if (cartItemIds.length > 0) {
      const cartObjectIds = cartItemIds.map((id) => new mongoose.Types.ObjectId(id));

      const matchingCombos = await Combo.find({
        franchiseId: tenant.franchiseId,
        outletId: tenant.outletId,
        isDeleted: false,
        isActive: true,
        "items.menuItemId": { $in: cartObjectIds },
      })
        .select("_id name description imageUrl items originalPrice comboPrice serviceType")
        .lean();

      if (matchingCombos.length > 0) {
        // Pick the combo with the most cart-item overlap
        const best = matchingCombos
          .map((combo) => {
            const overlap = combo.items.filter((ci) =>
              cartItemIds.includes(String(ci.menuItemId))
            ).length;
            return { ...combo, overlap };
          })
          .sort((a, b) => b.overlap - a.overlap)[0];

        comboDeal = {
          _id: best._id,
          name: best.name,
          description: best.description,
          imageUrl: best.imageUrl,
          items: best.items,
          originalPrice: best.originalPrice,
          comboPrice: best.comboPrice,
          serviceType: best.serviceType,
          overlapCount: best.overlap,
        };
      }
    }

    return { suggestions, comboDeal };
  });
}
