import Category from "../../../modules/menu/category.model.js";
import MenuItem from "../../../modules/menu/menuItem.model.js";
import Combo from "../../../modules/menu/combo.model.js";
import { getRedisClient } from "../../cache/redis.client.js";
import { buildTenantKey } from "../../cache/cache.utils.js";
import { getIO } from "../../../realtime/realtime.manager.js";

function emitMenuUpdated(outletId, type) {
  try {
    getIO().to(`outlet:${outletId}`).emit("menu:updated", { type, outletId });
  } catch {
    // non-fatal
  }
}

async function invalidateMenuCache(keys, tenant) {
  const redis = getRedisClient();
  await Promise.all(keys.map((key) => redis.del(buildTenantKey(key, tenant))));
}

export async function handleMenuPriceUpdate(payload) {
  const { itemId, price, tenant } = payload;

  const item = await MenuItem.findOneAndUpdate(
    {
      _id: itemId,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { price },
    { new: true },
  );

  if (!item) throw new Error(`Menu item not found for price update: ${itemId}`);

  await invalidateMenuCache(["menuItems"], tenant);

  emitMenuUpdated(tenant.outletId, "MENU_PRICE_UPDATE");
  console.log(
    `[queue] Price updated — item=${itemId} price=${price} outlet=${tenant.outletId}`,
  );

  return item;
}

export async function handleMenuStockUpdate(payload) {
  const { itemId, stockQuantity, tenant } = payload;

  const currentItem = await MenuItem.findOne({
    _id: itemId,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  });

  if (!currentItem)
    throw new Error(`Menu item not found for stock update: ${itemId}`);

  if ((currentItem.inventoryMode ?? "RECIPE") !== "DIRECT") {
    throw new Error(
      `Direct stock updates are only allowed for DIRECT inventory items: ${itemId}`,
    );
  }

  const item = await MenuItem.findOneAndUpdate(
    {
      _id: itemId,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { stockQuantity },
    { new: true },
  );

  if (!item) throw new Error(`Menu item not found for stock update: ${itemId}`);

  await invalidateMenuCache(["menuItems"], tenant);

  emitMenuUpdated(tenant.outletId, "MENU_STOCK_UPDATE");
  console.log(
    `[queue] Stock updated — item=${itemId} qty=${stockQuantity} outlet=${tenant.outletId}`,
  );

  return item;
}

export async function handleMenuCategoryCreate(payload) {
  const { data, tenant } = payload;

  const category = await Category.create({
    ...data,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });

  await invalidateMenuCache(["categories"], tenant);

  emitMenuUpdated(tenant.outletId, "MENU_CATEGORY_CREATE");
  console.log(
    `[queue] Category created — id=${category._id} outlet=${tenant.outletId}`,
  );
  return category;
}

export async function handleMenuCategoryUpdate(payload) {
  const { id, data, tenant } = payload;

  const category = await Category.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    data,
    { new: true },
  );

  if (!category) throw new Error(`Category not found for update: ${id}`);

  await invalidateMenuCache(["categories"], tenant);

  emitMenuUpdated(tenant.outletId, "MENU_CATEGORY_UPDATE");
  console.log(`[queue] Category updated — id=${id} outlet=${tenant.outletId}`);
  return category;
}

export async function handleMenuCategoryDelete(payload) {
  const { id, tenant } = payload;

  const category = await Category.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true },
  );

  if (!category) throw new Error(`Category not found for delete: ${id}`);

  await MenuItem.updateMany(
    {
      categoryId: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { isDeleted: true },
  );

  await invalidateMenuCache(
    ["categories", "menuItems", `menuItems:${id}`],
    tenant,
  );

  emitMenuUpdated(tenant.outletId, "MENU_CATEGORY_DELETE");
  console.log(
    `[queue] Category deleted (cascade) — id=${id} outlet=${tenant.outletId}`,
  );
  return category;
}

export async function handleMenuItemCreate(payload) {
  const { data, tenant } = payload;

  const item = await MenuItem.create({
    ...data,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });

  const keys = ["menuItems"];
  if (data.categoryId) keys.push(`menuItems:${data.categoryId}`);
  await invalidateMenuCache(keys, tenant);

  emitMenuUpdated(tenant.outletId, "MENU_ITEM_CREATE");
  console.log(
    `[queue] Menu item created — id=${item._id} outlet=${tenant.outletId}`,
  );
  return item;
}

export async function handleMenuItemUpdate(payload) {
  const { id, data, tenant } = payload;

  const item = await MenuItem.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    data,
    { new: true },
  );

  if (!item) throw new Error(`Menu item not found for update: ${id}`);

  const keys = ["menuItems"];
  if (item.categoryId) keys.push(`menuItems:${item.categoryId}`);
  await invalidateMenuCache(keys, tenant);

  emitMenuUpdated(tenant.outletId, "MENU_ITEM_UPDATE");
  console.log(`[queue] Menu item updated — id=${id} outlet=${tenant.outletId}`);
  return item;
}

export async function handleMenuItemDelete(payload) {
  const { id, tenant } = payload;

  const item = await MenuItem.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true },
  );

  if (!item) throw new Error(`Menu item not found for delete: ${id}`);

  const keys = ["menuItems"];
  if (item.categoryId) keys.push(`menuItems:${item.categoryId}`);
  await invalidateMenuCache(keys, tenant);

  emitMenuUpdated(tenant.outletId, "MENU_ITEM_DELETE");
  console.log(`[queue] Menu item deleted — id=${id} outlet=${tenant.outletId}`);
  return item;
}

export async function handleMenuItemStatusUpdate(payload) {
  const { id, tenant } = payload;

  const current = await MenuItem.findOne({
    _id: id,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  });

  if (!current) throw new Error(`Menu item not found for status toggle: ${id}`);

  const item = await MenuItem.findByIdAndUpdate(
    id,
    { isActive: !current.isActive },
    { new: true },
  );

  const keys = ["menuItems"];
  if (item.categoryId) keys.push(`menuItems:${item.categoryId}`);
  await invalidateMenuCache(keys, tenant);

  emitMenuUpdated(tenant.outletId, "MENU_ITEM_STATUS_UPDATE");
  console.log(
    `[queue] Item status toggled — id=${id} isActive=${item.isActive} outlet=${tenant.outletId}`,
  );
  return item;
}

export async function handleComboCreate(payload) {
  const { data, tenant } = payload;

  const combo = await Combo.create({
    ...data,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });

  emitMenuUpdated(tenant.outletId, "COMBO_CREATE");
  console.log(
    `[queue] Combo created — id=${combo._id} outlet=${tenant.outletId}`,
  );
  return combo;
}

export async function handleComboUpdate(payload) {
  const { id, data, tenant } = payload;

  const combo = await Combo.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    data,
    { new: true },
  );

  if (!combo) throw new Error(`Combo not found for update: ${id}`);

  emitMenuUpdated(tenant.outletId, "COMBO_UPDATE");
  console.log(`[queue] Combo updated — id=${id} outlet=${tenant.outletId}`);
  return combo;
}

export async function handleComboDelete(payload) {
  const { id, tenant } = payload;

  const combo = await Combo.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true },
  );

  if (!combo) throw new Error(`Combo not found for delete: ${id}`);

  emitMenuUpdated(tenant.outletId, "COMBO_DELETE");
  console.log(`[queue] Combo deleted — id=${id} outlet=${tenant.outletId}`);
  return combo;
}
