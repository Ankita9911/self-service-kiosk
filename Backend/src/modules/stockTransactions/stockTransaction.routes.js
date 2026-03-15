import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { attachOutletForMenu } from "../outlets/middleware/outlet.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import { createManualTransactionSchema } from "./stockTransaction.schemas.js";
import * as stockTransactionController from "./stockTransaction.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant, attachOutletForMenu);

router.post(
  "/",
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  validate(createManualTransactionSchema),
  stockTransactionController.createManualTransaction,
);

router.get(
  "/",
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  stockTransactionController.getTransactions,
);

router.get(
  "/:ingredientId/history",
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  stockTransactionController.getTransactionsByIngredient,
);

export default router;
