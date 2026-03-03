import Category from "./category.model.js";
import MenuItem from "./menuItem.model.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";
import { enqueue } from "../../core/queue/queue.producer.js";

export async function createCategory(data, tenant) {
  await enqueue("MENU_CATEGORY_CREATE", { data, tenant });
  return { queued: true };
}

export async function getCategories(tenant) {
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("categories", tenant);
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(2);
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
  await enqueue("MENU_ITEM_CREATE", { data, tenant });
  return { queued: true };
}

export async function getMenuItems(tenant, { categoryId, search, status } = {}) {
  const redis = getRedisClient();

  // Skip cache when search or status filters are active — results are dynamic
  const useCache = !search?.trim() && (!status || status === "ALL");

  const baseKey = categoryId ? `menuItems:${categoryId}` : "menuItems";
  const cacheKey = buildTenantKey(baseKey, tenant);

  if (useCache) {
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
  }

  const filter = {
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  };

  if (categoryId) filter.categoryId = categoryId;

  if (search?.trim()) {
    filter.name = { $regex: search.trim(), $options: "i" };
  }

  if (status === "ACTIVE") filter.isActive = { $ne: false };
  if (status === "INACTIVE") filter.isActive = false;

  const items = await MenuItem.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  if (useCache) {
    await redis.set(cacheKey, JSON.stringify(items), "EX", 300);
  }

  return items;
}

export async function updateMenuItem(id, data, tenant) {
  await enqueue("MENU_ITEM_UPDATE", { id, data, tenant });
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