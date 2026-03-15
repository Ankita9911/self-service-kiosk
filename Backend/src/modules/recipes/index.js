import express from "express";
import { authenticate } from "../../core/auth/middleware/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { attachOutletForMenu } from "../outlets/middleware/outlet.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import { validate } from "../../shared/validation/validate.middleware.js";
import {
  createRecipeSchema,
  updateRecipeSchema,
  aiGenerateSchema,
} from "./validation/recipe.schemas.js";
import * as recipeController from "./controller/recipe.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant, attachOutletForMenu);

router.post(
  "/ai-generate",
  authorize(PERMISSIONS.RECIPE_MANAGE),
  validate(aiGenerateSchema),
  recipeController.generateRecipeWithAI,
);

router.post(
  "/",
  authorize(PERMISSIONS.RECIPE_MANAGE),
  validate(createRecipeSchema),
  recipeController.createRecipe,
);

router.get(
  "/",
  authorize(PERMISSIONS.RECIPE_MANAGE),
  recipeController.getRecipes,
);

router.get(
  "/by-item/:menuItemId",
  authorize(PERMISSIONS.RECIPE_MANAGE),
  recipeController.getRecipeByMenuItemId,
);

router.get(
  "/:id",
  authorize(PERMISSIONS.RECIPE_MANAGE),
  recipeController.getRecipeById,
);

router.patch(
  "/:id",
  authorize(PERMISSIONS.RECIPE_MANAGE),
  validate(updateRecipeSchema),
  recipeController.updateRecipe,
);

router.delete(
  "/:id",
  authorize(PERMISSIONS.RECIPE_MANAGE),
  recipeController.deleteRecipe,
);

export default router;
