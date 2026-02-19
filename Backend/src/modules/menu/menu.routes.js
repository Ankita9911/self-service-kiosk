import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./menu.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant);

// =========================
// CATEGORY
// =========================

router.post(
  "/categories",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.createCategory
);

router.get(
  "/categories",
  authorize(PERMISSIONS.MENU_MANAGE), // later change to MENU_VIEW
  controller.getCategories
);

router.put(
  "/categories/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.updateCategory
);

router.delete(
  "/categories/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.deleteCategory
);

// =========================
// MENU ITEMS
// =========================

router.post(
  "/items",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.createMenuItem
);

router.get(
  "/items",
  authorize(PERMISSIONS.MENU_MANAGE), // later change to MENU_VIEW
  controller.getMenuItems
);

router.put(
  "/items/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.updateMenuItem
);

router.delete(
  "/items/:id",
  authorize(PERMISSIONS.MENU_MANAGE),
  controller.deleteMenuItem
);

export default router;
