import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import * as recipeService from "./recipe.service.js";

export const createRecipe = asyncHandler(async (req, res) => {
  const recipe = await recipeService.createRecipe(req.body, req.tenant);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Recipe created",
    data: recipe,
  });
});

export const getRecipes = asyncHandler(async (req, res) => {
  const result = await recipeService.getRecipes(req.tenant, req.query);
  return sendSuccess(res, {
    message: "Recipes fetched",
    data: result.items,
    meta: result.meta,
  });
});

export const getRecipeById = asyncHandler(async (req, res) => {
  const recipe = await recipeService.getRecipeById(req.params.id, req.tenant);
  return sendSuccess(res, {
    message: "Recipe fetched",
    data: recipe,
  });
});

export const getRecipeByMenuItemId = asyncHandler(async (req, res) => {
  const recipe = await recipeService.getRecipeByMenuItemId(
    req.params.menuItemId,
    req.tenant
  );
  return sendSuccess(res, {
    message: recipe ? "Recipe fetched" : "No recipe configured for this menu item",
    data: recipe,
  });
});

export const updateRecipe = asyncHandler(async (req, res) => {
  const recipe = await recipeService.updateRecipe(req.params.id, req.body, req.tenant);
  return sendSuccess(res, {
    message: "Recipe updated",
    data: recipe,
  });
});

export const deleteRecipe = asyncHandler(async (req, res) => {
  const result = await recipeService.deleteRecipe(req.params.id, req.tenant);
  return sendSuccess(res, {
    message: "Recipe deleted",
    data: result,
  });
});

export const generateRecipeWithAI = asyncHandler(async (req, res) => {
  const { description } = req.body;
  if (!description?.trim()) {
    const { AppError } = await import("../../shared/errors/AppError.js");
    throw new AppError("description is required", 400, "MISSING_DESCRIPTION");
  }

  const suggestion = await recipeService.generateRecipeWithAI(description.trim());
  return sendSuccess(res, {
    message: "AI recipe suggestion generated — review and save to confirm",
    data: suggestion,
  });
});
