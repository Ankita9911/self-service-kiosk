import Category from "./category.model.js";
import MenuItem from "./menuItem.model.js";
import AppError from "../../shared/errors/AppError.js";
import { getRedisClient } from "../../core/cache/redis.client.js";
import { buildTenantKey } from "../../core/cache/cache.utils.js";

export async function createCategory(data, tenant) {
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("categories", tenant);

  const category = await Category.create({
    ...data,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });

  await redis.del(cacheKey); 

  return category;
}

export async function getCategories(tenant) {
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("categories", tenant);
  console.log(1);
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
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("categories", tenant);

  const category = await Category.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    data,
    { new: true }
  );

  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  await redis.del(cacheKey);

  return category;
}

export async function deleteCategory(id, tenant) {
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("categories", tenant);

  const category = await Category.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true }
  );

  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  await redis.del(cacheKey);

  return category;
}

export async function createMenuItem(data, tenant) {
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("menuItems", tenant);

  const item = await MenuItem.create({
    ...data,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });

  await redis.del(cacheKey);

  return item;
}

export async function getMenuItems(tenant, categoryId) {
  const redis = getRedisClient();

  const baseKey = categoryId
    ? `menuItems:${categoryId}`
    : "menuItems";

  const cacheKey = buildTenantKey(baseKey, tenant);
  console.log(1);
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log(1);
    return JSON.parse(cached);
  }

  const filter = {
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  };

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  const items = await MenuItem.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  await redis.set(cacheKey, JSON.stringify(items), "EX", 300);

  return items;
}

export async function updateMenuItem(id, data, tenant) {
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("menuItems", tenant);

  const item = await MenuItem.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    data,
    { new: true }
  );

  if (!item) {
    throw new AppError("Menu item not found", 404, "MENU_ITEM_NOT_FOUND");
  }

  await redis.del(cacheKey);

  return item;
}

export async function deleteMenuItem(id, tenant) {
  const redis = getRedisClient();
  const cacheKey = buildTenantKey("menuItems", tenant);

  const item = await MenuItem.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true }
  );

  if (!item) {
    throw new AppError("Menu item not found", 404, "MENU_ITEM_NOT_FOUND");
  }

  await redis.del(cacheKey);

  return item;
}