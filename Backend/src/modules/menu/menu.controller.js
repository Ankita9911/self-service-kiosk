import * as menuService from "./menu.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const result = await menuService.createCategory(req.body, req.tenant);

  return sendSuccess(res, {
    statusCode: 202,
    message: "Category creation accepted and queued for processing",
    data: result,
  });
});

export const getCategories = asyncHandler(async (req, res) => {
  const result = await menuService.getCategories(req.tenant);

  return sendSuccess(res, {
    message: "Categories fetched successfully",
    data: result,
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const result = await menuService.updateCategory(req.params.id, req.body, req.tenant);

  return sendSuccess(res, {
    statusCode: 202,
    message: "Category update accepted and queued for processing",
    data: result,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await menuService.deleteCategory(req.params.id, req.tenant);

  return sendSuccess(res, {
    statusCode: 202,
    message: "Category deletion accepted and queued for processing",
  });
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const result = await menuService.createMenuItem(req.body, req.tenant);

  return sendSuccess(res, {
    statusCode: 202,
    message: "Menu item creation accepted and queued for processing",
    data: result,
  });
});

export const getMenuItems = asyncHandler(async (req, res) => {
  const { categoryId, search, status, cursor, limit } = req.query;

  const result = await menuService.getMenuItems(
    req.tenant,
    { categoryId, search, status, cursor, limit }
  );

  return sendSuccess(res, {
    message: "Menu items fetched successfully",
    data: result.items,
    meta: result.meta,
  });
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const result = await menuService.updateMenuItem(req.params.id, req.body, req.tenant);

  return sendSuccess(res, {
    statusCode: 202,
    message: "Menu item update accepted and queued for processing",
    data: result,
  });
});

export const updateItemPrice = asyncHandler(async (req, res) => {
  const result = await menuService.updateItemPrice(req.params.id, req.body.price, req.tenant);

  return sendSuccess(res, {
    statusCode: 202,
    message: "Price update accepted and queued for processing",
    data: result,
  });
});

export const updateItemStock = asyncHandler(async (req, res) => {
  const result = await menuService.updateItemStock(
    req.params.id,
    req.body.stockQuantity,
    req.tenant
  );

  return sendSuccess(res, {
    statusCode: 202,
    message: "Stock update accepted and queued for processing",
    data: result,
  });
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  await menuService.deleteMenuItem(req.params.id, req.tenant);

  return sendSuccess(res, {
    statusCode: 202,
    message: "Menu item deletion accepted and queued for processing",
  });
});

export const toggleItemStatus = asyncHandler(async (req, res) => {
  const result = await menuService.toggleItemStatus(req.params.id, req.tenant);

  return sendSuccess(res, {
    statusCode: 202,
    message: "Item status toggle accepted and queued for processing",
    data: result,
  });
});
