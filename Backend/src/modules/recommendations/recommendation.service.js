import mongoose from "mongoose";
import Order from "../orders/order.model.js";
import MenuItem from "../menu/menuItem.model.js";
import Combo from "../menu/combo.model.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";

const TTL = {
  TRENDING: 5 * 60,
  FREQUENTLY_BOUGHT: 30 * 60,
  COMPLETE_MEAL: 10 * 60,
};

async function withCache(key, ttl, fn) {
  let redis;
  try {
    redis = getRedisClient();
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch {
    // non-fatal
  }

  const result = await fn();

  try {
    if (redis) await redis.setex(key, ttl, JSON.stringify(result));
  } catch {
    // non-fatal
  }

  return result;
}

export async function getTrending(tenant, options = {}) {
  const { windowHours = 4, limit = 8 } = options;
  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const since = new Date(Date.now() - windowHours * 60 * 60 * 1000);
  const cacheKey = buildTenantKey(
    `rec:trending:${windowHours}h:${limit}`,
    tenant,
  );

  return withCache(cacheKey, TTL.TRENDING, async () => {
    const soldItems = await Order.aggregate([
      {
        $match: {
          outletId,
          createdAt: { $gte: since },
          status: { $nin: ["CREATED"] },
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
      { $limit: limit * 2 },
    ]);

    if (soldItems.length === 0) return [];

    const itemIds = soldItems.map((s) => s._id);

    const liveItems = await MenuItem.find({
      _id: { $in: itemIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
      isActive: true,
    })
      .select(
        "_id name description imageUrl price stockQuantity offers categoryId serviceType",
      )
      .lean();

    const liveMap = new Map(liveItems.map((item) => [String(item._id), item]));

    return soldItems
      .map((sold) => {
        const live = liveMap.get(String(sold._id));
        if (!live || live.stockQuantity <= 0) return null;

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
  });
}

export async function getFrequentlyBoughtTogether(
  tenant,
  itemIds = [],
  options = {},
) {
  const { limit = 5, windowDays = 30 } = options;

  if (!itemIds.length) return [];

  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const sortedIds = [...itemIds].sort().join(",");
  const cacheKey = buildTenantKey(
    `rec:fbt:${sortedIds}:${windowDays}d`,
    tenant,
  );

  return withCache(cacheKey, TTL.FREQUENTLY_BOUGHT, async () => {
    const seedIds = itemIds.map((id) => new mongoose.Types.ObjectId(id));

    const coOrders = await Order.aggregate([
      {
        $match: {
          outletId,
          createdAt: { $gte: since },
          "items.itemId": { $in: seedIds },
        },
      },
      { $unwind: "$items" },
      { $match: { "items.itemId": { $nin: seedIds } } },
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

    const liveItems = await MenuItem.find({
      _id: { $in: candidateIds },
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
      isActive: true,
    })
      .select(
        "_id name description imageUrl price stockQuantity offers categoryId serviceType",
      )
      .lean();

    const liveMap = new Map(liveItems.map((item) => [String(item._id), item]));

    return coOrders
      .map((co) => {
        const live = liveMap.get(String(co._id));
        if (!live || live.stockQuantity <= 0) return null;

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
  });
}

export async function getCompleteMeal(
  tenant,
  cartItemIds = [],
  cartCategoryIds = [],
  options = {},
) {
  const { limit = 4, windowDays = 30 } = options;

  const outletId = new mongoose.Types.ObjectId(tenant.outletId);
  const since = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);
  const sortedCatIds = [...cartCategoryIds].sort().join(",");
  const cacheKey = buildTenantKey(
    `rec:meal:${sortedCatIds}:${windowDays}d`,
    tenant,
  );

  return withCache(cacheKey, TTL.COMPLETE_MEAL, async () => {
    const popularFromOtherCategories = await Order.aggregate([
      { $match: { outletId, createdAt: { $gte: since } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.itemId",
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 50 },
    ]);

    if (popularFromOtherCategories.length === 0)
      return { suggestions: [], comboDeal: null };

    const popularIds = popularFromOtherCategories.map((p) => p._id);
    const excludedCategoryIds = cartCategoryIds.map(
      (id) => new mongoose.Types.ObjectId(id),
    );
    const excludedItemIds = cartItemIds.map(
      (id) => new mongoose.Types.ObjectId(id),
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
      ...(excludedItemIds.length > 0 && { _id: { $nin: excludedItemIds } }),
    })
      .select(
        "_id name description imageUrl price stockQuantity offers categoryId serviceType",
      )
      .lean();

    const popularRankMap = new Map(
      popularFromOtherCategories.map((p, idx) => [String(p._id), idx]),
    );
    liveItems.sort(
      (a, b) =>
        (popularRankMap.get(String(a._id)) ?? 999) -
        (popularRankMap.get(String(b._id)) ?? 999),
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

    let comboDeal = null;
    if (cartItemIds.length > 0) {
      const cartObjectIds = cartItemIds.map(
        (id) => new mongoose.Types.ObjectId(id),
      );

      const matchingCombos = await Combo.find({
        franchiseId: tenant.franchiseId,
        outletId: tenant.outletId,
        isDeleted: false,
        isActive: true,
        "items.menuItemId": { $in: cartObjectIds },
      })
        .select(
          "_id name description imageUrl items originalPrice comboPrice serviceType",
        )
        .lean();

      if (matchingCombos.length > 0) {
        const best = matchingCombos
          .map((combo) => {
            const overlap = combo.items.filter((ci) =>
              cartItemIds.includes(String(ci.menuItemId)),
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
