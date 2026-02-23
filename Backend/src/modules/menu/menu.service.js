import Category from "./category.model.js";
import MenuItem from "./menuItem.model.js";
import AppError from "../../shared/errors/AppError.js";

export async function createCategory(data, tenant) {
  return Category.create({
    ...data,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });
}

export async function getCategories(tenant) {
  return Category.find({
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  }).sort({ displayOrder: 1 });
}

export async function updateCategory(id, data, tenant) {
  const category = await Category.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    data,
    { new: true }
  );

  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  return category;
}

export async function deleteCategory(id, tenant) {
  const category = await Category.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true }
  );

  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  return category;
}

export async function createMenuItem(data, tenant) {
  return MenuItem.create({
    ...data,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
  });
}

export async function getMenuItems(tenant, categoryId) {
  const filter = {
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    isDeleted: false,
  };

  if (categoryId) {
    filter.categoryId = categoryId;
  }

  return MenuItem.find(filter).sort({ createdAt: -1 });
}

export async function updateMenuItem(id, data, tenant) {
  const item = await MenuItem.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    data,
    { new: true }
  );

  if (!item) {
    throw new AppError("Menu item not found", 404, "MENU_ITEM_NOT_FOUND");
  }

  return item;
}

export async function deleteMenuItem(id, tenant) {
  const item = await MenuItem.findOneAndUpdate(
    {
      _id: id,
      franchiseId: tenant.franchiseId,
      outletId: tenant.outletId,
      isDeleted: false,
    },
    { isDeleted: true },
    { new: true }
  );

  if (!item) {
    throw new AppError("Menu item not found", 404, "MENU_ITEM_NOT_FOUND");
  }

  return item;
}
