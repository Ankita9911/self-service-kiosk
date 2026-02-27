import MenuItem from "../../../modules/menu/menuItem.model.js";
import { getRedisClient } from "../../cache/redis.client.js";
import { buildTenantKey } from "../../cache/cache.utils.js";

/**
 * Handles MENU_PRICE_UPDATE messages from the SQS queue.
 */
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
    { new: true }
  );

  if (!item) {
    throw new Error(`Menu item not found for price update: ${itemId}`);
  }

  const redis = getRedisClient();
  await redis.del(buildTenantKey("menuItems", tenant));

  console.log(
    `[queue] Price updated — item=${itemId} price=${price} outlet=${tenant.outletId}`
  );

  return item;
}

/**
 * Handles MENU_STOCK_UPDATE messages from the SQS queue.
 */
export async function handleMenuStockUpdate(payload) {
  const { itemId, stockQuantity, tenant } = payload;

  const item = await MenuItem.findOneAndUpdate(
    {
      _id: itemId,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { stockQuantity },
    { new: true }
  );

  if (!item) {
    throw new Error(`Menu item not found for stock update: ${itemId}`);
  }

  const redis = getRedisClient();
  await redis.del(buildTenantKey("menuItems", tenant));

  console.log(
    `[queue] Stock updated — item=${itemId} qty=${stockQuantity} outlet=${tenant.outletId}`
  );

  return item;
}
