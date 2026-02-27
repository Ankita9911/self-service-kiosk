import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { attachOutletForMenu } from "../../core/tenancy/attachOutletForMenu.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./menu.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant, attachOutletForMenu);

router.post(
  "/categories",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.createCategory
);

router.get(
  "/categories",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.getCategories
);

router.patch(
  "/categories/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.updateCategory
);

router.delete(
  "/categories/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.deleteCategory
);

router.post(
  "/items",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.createMenuItem
);

router.get(
  "/items",
  authorize(PERMISSIONS.MENU_MANAGE), 
  controller.getMenuItems
);

router.put(
  "/items/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.updateMenuItem
);

router.patch(
  "/items/:id/price",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.updateItemPrice
);

router.patch(
  "/items/:id/stock",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.updateItemStock
);

router.delete(
  "/items/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.deleteMenuItem
);

export default router;