import * as menuService from "./menu.service.js";
import { sendSuccess } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
  const result = await menuService.createCategory(
    req.body,
    req.tenant
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Category created successfully",
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
  const result = await menuService.updateCategory(
    req.params.id,
    req.body,
    req.tenant
  );

  return sendSuccess(res, {
    message: "Category updated successfully",
    data: result,
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await menuService.deleteCategory(
    req.params.id,
    req.tenant
  );

  return sendSuccess(res, {
    message: "Category deleted successfully",
  });
});

export const createMenuItem = asyncHandler(async (req, res) => {
  const result = await menuService.createMenuItem(
    req.body,
    req.tenant
  );

  return sendSuccess(res, {
    statusCode: 201,
    message: "Menu item created successfully",
    data: result,
  });
});

export const getMenuItems = asyncHandler(async (req, res) => {
  const { categoryId } = req.query;

  const result = await menuService.getMenuItems(
    req.tenant,
    categoryId
  );

  return sendSuccess(res, {
    message: "Menu items fetched successfully",
    data: result,
  });
});

export const updateMenuItem = asyncHandler(async (req, res) => {
  const result = await menuService.updateMenuItem(
    req.params.id,
    req.body,
    req.tenant
  );

  return sendSuccess(res, {
    message: "Menu item updated successfully",
    data: result,
  });
});


export const updateItemPrice = asyncHandler(async (req, res) => {
  const { price } = req.body;
  const result = await menuService.updateItemPrice(
    req.params.id,
    parseFloat(price),
    req.tenant
  );
  return sendSuccess(res, {
    statusCode: 202,
    message: "Price update accepted and queued for processing",
    data: result,
  });
});

export const updateItemStock = asyncHandler(async (req, res) => {
  const { stockQuantity } = req.body;
  const result = await menuService.updateItemStock(
    req.params.id,
    parseInt(stockQuantity, 10),
    req.tenant
  );
  return sendSuccess(res, {
    statusCode: 202,
    message: "Stock update accepted and queued for processing",
    data: result,
  });
});

export const deleteMenuItem = asyncHandler(async (req, res) => {
  await menuService.deleteMenuItem(
    req.params.id,
    req.tenant
  );

  return sendSuccess(res, {
    message: "Menu item deleted successfully",
  });
});