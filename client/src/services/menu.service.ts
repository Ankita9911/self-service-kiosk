import axiosInstance from "./axiosInstance";
import type { Category, MenuItem } from "@/types/menu.types";

function params(outletId?: string) {
  return outletId ? { params: { outletId } } : {};
}

export async function getCategories(outletId?: string): Promise<Category[]> {
  const response = await axiosInstance.get<{ data: Category[] }>(
    "/menu/categories",
    params(outletId)
  );
  return response.data.data;
}

export async function createCategory(
  data: { name: string; description?: string; displayOrder?: number },
  outletId?: string
): Promise<Category> {
  const response = await axiosInstance.post<{ data: Category }>(
    "/menu/categories",
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function updateCategory(
  id: string,
  data: Partial<Category>,
  outletId?: string
): Promise<Category> {
  const response = await axiosInstance.put<{ data: Category }>(
    `/menu/categories/${id}`,
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function deleteCategory(id: string, outletId?: string): Promise<void> {
  await axiosInstance.delete(`/menu/categories/${id}`, params(outletId));
}

export async function getMenuItems(
  outletId?: string,
  categoryId?: string
): Promise<MenuItem[]> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  if (categoryId) p.categoryId = categoryId;
  const response = await axiosInstance.get<{ data: MenuItem[] }>("/menu/items", {
    params: Object.keys(p).length ? p : undefined,
  });
  return response.data.data;
}

export async function createMenuItem(
  data: {
    categoryId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    stockQuantity: number;
  },
  outletId?: string
): Promise<MenuItem> {
  const response = await axiosInstance.post<{ data: MenuItem }>(
    "/menu/items",
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function updateMenuItem(
  id: string,
  data: Partial<MenuItem>,
  outletId?: string
): Promise<MenuItem> {
  const response = await axiosInstance.put<{ data: MenuItem }>(
    `/menu/items/${id}`,
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function deleteMenuItem(id: string, outletId?: string): Promise<void> {
  await axiosInstance.delete(`/menu/items/${id}`, params(outletId));
}
