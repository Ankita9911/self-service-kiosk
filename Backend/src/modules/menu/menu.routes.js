import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./menu.controller.js";

const router = express.Router();

router.use(
  authenticate,
  attachTenant,
  authorize(PERMISSIONS.MENU_MANAGE)
);

// CATEGORY
router.post("/categories", controller.createCategory);
router.get("/categories", controller.getCategories);
router.put("/categories/:id", controller.updateCategory);
router.delete("/categories/:id", controller.deleteCategory);

// MENU ITEMS
router.post("/items", controller.createMenuItem);
router.get("/items", controller.getMenuItems);
router.put("/items/:id", controller.updateMenuItem);
router.delete("/items/:id", controller.deleteMenuItem);

export default router;
