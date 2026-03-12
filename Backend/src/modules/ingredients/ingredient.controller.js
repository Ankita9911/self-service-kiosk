import { asyncHandler } from "../../shared/utils/asyncHandler.js";
import { sendSuccess } from "../../shared/utils/response.js";
import * as ingredientService from "./ingredient.service.js";

export const createIngredient = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.createIngredient(req.body, req.tenant);
  return sendSuccess(res, {
    statusCode: 201,
    message: "Ingredient created",
    data: ingredient,
  });
});

export const getIngredients = asyncHandler(async (req, res) => {
  const result = await ingredientService.getIngredients(req.tenant, req.query);
  return sendSuccess(res, {
    message: "Ingredients fetched",
    data: result.items,
    meta: result.meta,
  });
});

export const getIngredientById = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.getIngredientById(req.params.id, req.tenant);
  return sendSuccess(res, {
    message: "Ingredient fetched",
    data: ingredient,
  });
});

export const updateIngredient = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.updateIngredient(req.params.id, req.body, req.tenant);
  return sendSuccess(res, {
    message: "Ingredient updated",
    data: ingredient,
  });
});

export const deleteIngredient = asyncHandler(async (req, res) => {
  const result = await ingredientService.deleteIngredient(req.params.id, req.tenant);
  return sendSuccess(res, {
    message: "Ingredient deleted",
    data: result,
  });
});

export const adjustStock = asyncHandler(async (req, res) => {
  const ingredient = await ingredientService.adjustStock(req.params.id, req.body, req.tenant);
  return sendSuccess(res, {
    message: "Stock adjusted",
    data: ingredient,
  });
});
