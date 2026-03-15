import express from "express";
import { authenticate } from "../../core/auth/middleware/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { attachOutletForMenu } from "../outlets/middleware/outlet.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  createMenuItemSchema,
  updateMenuItemSchema,
  updateItemPriceSchema,
  updateItemStockSchema,
} from "./validation/menu.schemas.js";
import * as controller from "./controller/menu.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant, attachOutletForMenu);

router.post(
  "/categories",
  authorize(PERMISSIONS.MENU_MANAGE),
  validate(createCategorySchema),
  controller.createCategory,
);

router.get(
  "/categories",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.getCategories,
);

router.patch(
  "/categories/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  validate(updateCategorySchema),
  controller.updateCategory,
);

router.delete(
  "/categories/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.deleteCategory,
);

router.post(
  "/items",
  authorize(PERMISSIONS.MENU_MANAGE),
  validate(createMenuItemSchema),
  controller.createMenuItem,
);

router.get(
  "/items",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.getMenuItems,
);

router.put(
  "/items/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  validate(updateMenuItemSchema),
  controller.updateMenuItem,
);

router.patch(
  "/items/:id/price",
  authorize(PERMISSIONS.MENU_MANAGE),
  validate(updateItemPriceSchema),
  controller.updateItemPrice,
);

router.patch(
  "/items/:id/stock",
  authorize(PERMISSIONS.MENU_MANAGE),
  validate(updateItemStockSchema),
  controller.updateItemStock,
);

router.delete(
  "/items/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.deleteMenuItem,
);

router.patch(
  "/items/:id/status",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.toggleItemStatus,
);

export default router;
