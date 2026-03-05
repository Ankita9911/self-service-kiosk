import axiosInstance from "@/shared/lib/axiosInstance";
import type { Category, MenuItem, Combo } from "@/features/kiosk/types/menu.types";

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
  categoryId?: string,
  search?: string,
  status?: "ALL" | "ACTIVE" | "INACTIVE",
  options?: { cursor?: string; limit?: number }
): Promise<{
  items: MenuItem[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
    totalMatching: number;
  };
  stats: {
    totalItems: number;
    activeItems: number;
  };
}> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  if (categoryId) p.categoryId = categoryId;
  if (search?.trim()) p.search = search.trim();
  if (status && status !== "ALL") p.status = status;
  if (options?.cursor) p.cursor = options.cursor;
  if (typeof options?.limit === "number") p.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: MenuItem[];
    meta?: {
      pagination?: {
        limit?: number;
        hasNext?: boolean;
        nextCursor?: string | null;
        totalMatching?: number;
      };
      stats?: {
        totalItems?: number;
        activeItems?: number;
      };
    };
  }>("/menu/items", {
    params: Object.keys(p).length ? p : undefined,
  });

  const pagination = response.data.meta?.pagination ?? {};
  const stats = response.data.meta?.stats ?? {};

  return {
    items: response.data.data,
    pagination: {
      limit: pagination.limit ?? options?.limit ?? 12,
      hasNext: pagination.hasNext ?? false,
      nextCursor: pagination.nextCursor ?? null,
      totalMatching: pagination.totalMatching ?? response.data.data.length,
    },
    stats: {
      totalItems: stats.totalItems ?? response.data.data.length,
      activeItems: stats.activeItems ?? response.data.data.filter((item) => item.isActive !== false).length,
    },
  };
}

export async function createMenuItem(
  data: {
    categoryId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    price: number;
    stockQuantity: number;
    serviceType?: "DINE_IN" | "TAKE_AWAY" | "BOTH";
    offers?: MenuItem["offers"];
    customizationItemIds?: string[];
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
  data: Partial<MenuItem> & { customizationItemIds?: string[] },
  outletId?: string
): Promise<MenuItem> {
  const response = await axiosInstance.put<{ data: MenuItem }>(
    `/menu/items/${id}`,
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function updateMenuItemPrice(
  id: string,
  price: number,
  outletId?: string
): Promise<MenuItem> {
  const response = await axiosInstance.patch<{ data: MenuItem }>(
    `/menu/items/${id}/price`,
    { price, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function updateMenuItemStock(
  id: string,
  stockQuantity: number,
  outletId?: string
): Promise<MenuItem> {
  const response = await axiosInstance.patch<{ data: MenuItem }>(
    `/menu/items/${id}/stock`,
    { stockQuantity, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function deleteMenuItem(id: string, outletId?: string): Promise<void> {
  await axiosInstance.delete(`/menu/items/${id}`, params(outletId));
}

export async function toggleMenuItemStatus(id: string, outletId?: string): Promise<{ queued: boolean }> {
  const response = await axiosInstance.patch<{ data: { queued: boolean } }>(
    `/menu/items/${id}/status`,
    outletId ? { outletId } : {}
  );
  return response.data.data;
}

// ─── Combos ───────────────────────────────────────────────────────────────────

export async function getCombos(outletId?: string): Promise<Combo[]> {
  const response = await axiosInstance.get<{ data: Combo[] }>("/combos", params(outletId));
  return response.data.data;
}

export async function createCombo(
  data: {
    name: string;
    description?: string;
    imageUrl?: string;
    items: { menuItemId: string; name: string; quantity: number }[];
    originalPrice?: number;
    comboPrice: number;
    serviceType?: "DINE_IN" | "TAKE_AWAY" | "BOTH";
  },
  outletId?: string
): Promise<{ queued: boolean }> {
  const response = await axiosInstance.post<{ data: { queued: boolean } }>(
    "/combos",
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function updateCombo(
  id: string,
  data: Partial<Combo>,
  outletId?: string
): Promise<{ queued: boolean }> {
  const response = await axiosInstance.put<{ data: { queued: boolean } }>(
    `/combos/${id}`,
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function deleteCombo(id: string, outletId?: string): Promise<void> {
  await axiosInstance.delete(`/combos/${id}`, params(outletId));
}
