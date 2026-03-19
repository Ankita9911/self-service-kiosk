import { handleOrderPlaced } from "./handlers/order.handler.js";
import { handleLowStockAlert } from "./handlers/inventory.handler.js";
import { handleLowStockAlertQueue } from "./handlers/lowStockAlert.handler.js";
import {
  handleAnalyticsOrderPlaced,
  handleAnalyticsOrderStatusChanged,
} from "./handlers/analytics.handler.js";
import {
  handleMenuPriceUpdate,
  handleMenuStockUpdate,
  handleMenuCategoryCreate,
  handleMenuCategoryUpdate,
  handleMenuCategoryDelete,
  handleMenuItemCreate,
  handleMenuItemUpdate,
  handleMenuItemDelete,
  handleMenuItemStatusUpdate,
  handleComboCreate,
  handleComboUpdate,
  handleComboDelete,
} from "./handlers/menu.handler.js";

export const MESSAGE_HANDLERS = {
  ORDER_PLACED: handleOrderPlaced,
  ANALYTICS_ORDER_PLACED: handleAnalyticsOrderPlaced,
  ANALYTICS_ORDER_STATUS_CHANGED: handleAnalyticsOrderStatusChanged,
  LOW_STOCK_ALERT: handleLowStockAlert,
  MENU_PRICE_UPDATE: handleMenuPriceUpdate,
  MENU_STOCK_UPDATE: handleMenuStockUpdate,
  MENU_CATEGORY_CREATE: handleMenuCategoryCreate,
  MENU_CATEGORY_UPDATE: handleMenuCategoryUpdate,
  MENU_CATEGORY_DELETE: handleMenuCategoryDelete,
  MENU_ITEM_CREATE: handleMenuItemCreate,
  MENU_ITEM_UPDATE: handleMenuItemUpdate,
  MENU_ITEM_DELETE: handleMenuItemDelete,
  MENU_ITEM_STATUS_UPDATE: handleMenuItemStatusUpdate,
  COMBO_CREATE: handleComboCreate,
  COMBO_UPDATE: handleComboUpdate,
  COMBO_DELETE: handleComboDelete,
  LOW_STOCK_ALERT_EMAIL: handleLowStockAlertQueue,
};
