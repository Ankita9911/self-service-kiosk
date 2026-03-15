import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { attachOutletForMenu } from "../outlets/outlet.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as stockTransactionController from "./stockTransaction.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant, attachOutletForMenu);

// Manual stock entries (PURCHASE, WASTAGE, ADJUSTMENT)
router.post("/", authorize(PERMISSIONS.INVENTORY_MANAGE), stockTransactionController.createManualTransaction);

// Transaction log
router.get("/", authorize(PERMISSIONS.INVENTORY_MANAGE), stockTransactionController.getTransactions);

// History for a specific ingredient
router.get("/:ingredientId/history", authorize(PERMISSIONS.INVENTORY_MANAGE), stockTransactionController.getTransactionsByIngredient);

export default router;
