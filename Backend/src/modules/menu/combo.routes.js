import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { attachOutletForMenu } from "../../core/tenancy/attachOutletForMenu.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as controller from "./combo.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant, attachOutletForMenu);

router.get("/", authorize(PERMISSIONS.MENU_MANAGE), controller.getCombos);
router.post("/", authorize(PERMISSIONS.MENU_MANAGE), controller.createCombo);
router.put("/:id", authorize(PERMISSIONS.MENU_MANAGE), controller.updateCombo);
router.delete("/:id", authorize(PERMISSIONS.MENU_MANAGE), controller.deleteCombo);

export default router;
