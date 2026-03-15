import express from "express";
import { authenticate } from "../../core/auth/auth.middleware.js";
import { attachTenant } from "../../core/tenancy/tenancy.middleware.js";
import { attachOutletForMenu } from "../outlets/outlet.middleware.js";
import { authorize } from "../../core/rbac/rbac.middleware.js";
import { PERMISSIONS } from "../../core/rbac/permissions.js";
import * as recipeController from "./recipe.controller.js";

const router = express.Router();

router.use(authenticate, attachTenant, attachOutletForMenu);

// AI generation — returns suggestion, does NOT persist
router.post("/ai-generate", authorize(PERMISSIONS.RECIPE_MANAGE), recipeController.generateRecipeWithAI);

router.post("/", authorize(PERMISSIONS.RECIPE_MANAGE), recipeController.createRecipe);
router.get("/", authorize(PERMISSIONS.RECIPE_MANAGE), recipeController.getRecipes);

// Lookup recipe by menuItemId
router.get("/by-item/:menuItemId", authorize(PERMISSIONS.RECIPE_MANAGE), recipeController.getRecipeByMenuItemId);

router.get("/:id", authorize(PERMISSIONS.RECIPE_MANAGE), recipeController.getRecipeById);
router.patch("/:id", authorize(PERMISSIONS.RECIPE_MANAGE), recipeController.updateRecipe);
router.delete("/:id", authorize(PERMISSIONS.RECIPE_MANAGE), recipeController.deleteRecipe);

export default router;
