import * as menuService from "./menu.service.js";

// CATEGORY

export async function createCategory(req, res, next) {
  try {
    const result = await menuService.createCategory(
      req.body,
      req.tenant
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getCategories(req, res, next) {
  try {
    const result = await menuService.getCategories(req.tenant);

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const result = await menuService.updateCategory(
      req.params.id,
      req.body,
      req.tenant
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    await menuService.deleteCategory(req.params.id, req.tenant);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}

// MENU ITEMS

export async function createMenuItem(req, res, next) {
  try {
    const result = await menuService.createMenuItem(
      req.body,
      req.tenant
    );

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function getMenuItems(req, res, next) {
  try {
    const { categoryId } = req.query;

    const result = await menuService.getMenuItems(
      req.tenant,
      categoryId
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function updateMenuItem(req, res, next) {
  try {
    const result = await menuService.updateMenuItem(
      req.params.id,
      req.body,
      req.tenant
    );

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}

export async function deleteMenuItem(req, res, next) {
  try {
    await menuService.deleteMenuItem(req.params.id, req.tenant);
    res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
}
