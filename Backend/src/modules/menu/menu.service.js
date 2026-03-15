import Category from "./category.model.js";
import MenuItem from "./menuItem.model.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";
import { enqueue } from "../../core/queue/queue.producer.js";
import {
  toBoundedLimit,
  encodeCursor,
  decodeCursor,
} from "../../shared/utils/pagination.js";

const DEFAULT_LIMIT = 12;

export async function createCategory(data, tenant) {
  await enqueue("MENU_CATEGORY_CREATE", { data, tenant });
  return { queued: true };
}

export async function getCategories(tenant) {
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("categories", tenant);
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const categories = await Category.find({
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  })
    .sort({ displayOrder: 1 })
    .lean();

  await redis.set(cacheKey, JSON.stringify(categories), "EX", 300);

  return categories;
}

export async function updateCategory(id, data, tenant) {
  await enqueue("MENU_CATEGORY_UPDATE", { id, data, tenant });
  return { queued: true };
}

export async function deleteCategory(id, tenant) {
  await enqueue("MENU_CATEGORY_DELETE", { id, tenant });
  return { queued: true };
}

export async function createMenuItem(data, tenant) {
  const normalizedData = {
    ...data,
    customizationItemIds: [
      ...new Set((data.customizationItemIds || []).map(String)),
    ],
  };
  await enqueue("MENU_ITEM_CREATE", { data: normalizedData, tenant });
  return { queued: true };
}

export async function getMenuItems(
  tenant,
  { categoryId, search, status, cursor, limit } = {},
) {
  const pageLimit = toBoundedLimit(limit, DEFAULT_LIMIT);

  const baseFilter = {
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  };

  if (categoryId) baseFilter.categoryId = categoryId;

  if (search?.trim()) {
    baseFilter.name = { $regex: search.trim(), $options: "i" };
  }

  if (status === "ACTIVE") baseFilter.isActive = { $ne: false };
  if (status === "INACTIVE") baseFilter.isActive = false;

  const queryFilter = { ...baseFilter };

  const decodedCursor = decodeCursor(cursor);

  if (decodedCursor) {
    queryFilter.$or = [
      { createdAt: { $lt: decodedCursor.createdAt } },
      { createdAt: decodedCursor.createdAt, _id: { $lt: decodedCursor._id } },
    ];
  }

  const [itemsPlusOne, totalMatching, totalItems, activeItems] =
    await Promise.all([
      MenuItem.find(queryFilter)
        .sort({ createdAt: -1, _id: -1 })
        .limit(pageLimit + 1)
        .lean(),
      MenuItem.countDocuments(baseFilter),
      MenuItem.countDocuments({
        franchiseId: tenant.franchiseId,
        outletId: tenant.outletId,
        isDeleted: false,
      }),
      MenuItem.countDocuments({
        franchiseId: tenant.franchiseId,
        outletId: tenant.outletId,
        isDeleted: false,
        isActive: { $ne: false },
      }),
    ]);

  const hasNext = itemsPlusOne.length > pageLimit;
  const items = hasNext ? itemsPlusOne.slice(0, pageLimit) : itemsPlusOne;

  const lastItem = items[items.length - 1];
  const nextCursor =
    hasNext && lastItem
      ? encodeCursor({ createdAt: lastItem.createdAt, _id: lastItem._id })
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
        activeItems,
      },
    },
  };
}

export async function updateMenuItem(id, data, tenant) {
  const normalizedData = {
    ...data,
    ...(data.customizationItemIds
      ? {
          customizationItemIds: [
            ...new Set(
              data.customizationItemIds
                .map(String)
                .filter((itemId) => itemId !== String(id)),
            ),
          ],
        }
      : {}),
  };
  await enqueue("MENU_ITEM_UPDATE", { id, data: normalizedData, tenant });
  return { queued: true };
}

export async function updateItemPrice(id, price, tenant) {
  await enqueue("MENU_PRICE_UPDATE", { itemId: id, price, tenant });
  return { itemId: id, queued: true };
}

export async function updateItemStock(id, stockQuantity, tenant) {
  await enqueue("MENU_STOCK_UPDATE", { itemId: id, stockQuantity, tenant });
  return { itemId: id, queued: true };
}

export async function deleteMenuItem(id, tenant) {
  await enqueue("MENU_ITEM_DELETE", { id, tenant });
  return { queued: true };
}

export async function toggleItemStatus(id, tenant) {
  await enqueue("MENU_ITEM_STATUS_UPDATE", { id, tenant });
  return { queued: true };
}
