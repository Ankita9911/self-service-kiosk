import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { attachOutletForMenu } from "../outlets/outlet.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import {
  createIngredientSchema,
  updateIngredientSchema,
  adjustStockSchema,
} from "./ingredient.schemas.js";
import * as ingredientController from "./ingredient.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant, attachOutletForMenu);

router.post(
  "/",
  authorize(PERMISSIONS.INGREDIENT_MANAGE),
  validate(createIngredientSchema),
  ingredientController.createIngredient,
);

router.get(
  "/",
  authorize(PERMISSIONS.INGREDIENT_MANAGE),
  ingredientController.getIngredients,
);

router.get(
  "/:id",
  authorize(PERMISSIONS.INGREDIENT_MANAGE),
  ingredientController.getIngredientById,
);

router.patch(
  "/:id",
  authorize(PERMISSIONS.INGREDIENT_MANAGE),
  validate(updateIngredientSchema),
  ingredientController.updateIngredient,
);

router.delete(
  "/:id",
  authorize(PERMISSIONS.INGREDIENT_MANAGE),
  ingredientController.deleteIngredient,
);

router.patch(
  "/:id/stock",
  authorize(PERMISSIONS.INVENTORY_MANAGE),
  validate(adjustStockSchema),
  ingredientController.adjustStock,
);

export default router;
