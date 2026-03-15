import axiosInstance from "@/shared/lib/axiosInstance";
import type {
  Ingredient,
  IngredientFormState,
} from "../types/ingredient.types";

function outletParams(outletId?: string) {
  return outletId ? { params: { outletId } } : {};
}

export interface IngredientQueryOptions {
  search?: string;
  unit?: string;
  lowStock?: boolean;
  cursor?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}

export interface IngredientListResult {
  items: Ingredient[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
    totalMatching: number;
  };
  stats: {
    totalItems: number;
    lowStockItems: number;
  };
}

export async function getIngredients(
  outletId?: string,
  options?: IngredientQueryOptions,
): Promise<IngredientListResult> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  if (options?.search?.trim()) p.search = options.search.trim();
  if (options?.unit && options.unit !== "ALL") p.unit = options.unit;
  if (options?.lowStock) p.lowStock = "true";
  if (options?.cursor) p.cursor = options.cursor;
  if (typeof options?.limit === "number") p.limit = String(options.limit);
  if (options?.sortBy) p.sortBy = options.sortBy;
  if (options?.sortOrder) p.sortOrder = options.sortOrder;

  const response = await axiosInstance.get<{
    data: Ingredient[];
    meta?: {
      pagination?: {
        limit?: number;
        hasNext?: boolean;
        nextCursor?: string | null;
        totalMatching?: number;
      };
      stats?: {
        totalItems?: number;
        lowStockItems?: number;
      };
    };
  }>("/ingredients", { params: p });

  const pagination = response.data.meta?.pagination ?? {};
  const stats = response.data.meta?.stats ?? {};

  return {
    items: response.data.data,
    pagination: {
      limit: pagination.limit ?? 20,
      hasNext: pagination.hasNext ?? false,
      nextCursor: pagination.nextCursor ?? null,
      totalMatching: pagination.totalMatching ?? response.data.data.length,
    },
    stats: {
      totalItems: stats.totalItems ?? 0,
      lowStockItems: stats.lowStockItems ?? 0,
    },
  };
}

export async function getAllIngredients(
  outletId?: string,
): Promise<Ingredient[]> {
  const allItems: Ingredient[] = [];
  const seenIds = new Set<string>();
  let cursor: string | undefined;

  do {
    const result = await getIngredients(outletId, {
      limit: 100,
      sortBy: "name",
      sortOrder: "asc",
      cursor,
    });

    for (const item of result.items) {
      if (seenIds.has(item._id)) continue;
      seenIds.add(item._id);
      allItems.push(item);
    }

    cursor = result.pagination.hasNext
      ? (result.pagination.nextCursor ?? undefined)
      : undefined;
  } while (cursor);

  return allItems;
}

export async function getIngredientById(
  id: string,
  outletId?: string,
): Promise<Ingredient> {
  const response = await axiosInstance.get<{ data: Ingredient }>(
    `/ingredients/${id}`,
    outletParams(outletId),
  );
  return response.data.data;
}

export async function createIngredient(
  data: IngredientFormState,
  outletId?: string,
): Promise<Ingredient> {
  const response = await axiosInstance.post<{ data: Ingredient }>(
    "/ingredients",
    { ...data, ...(outletId && { outletId }) },
  );
  return response.data.data;
}

export async function updateIngredient(
  id: string,
  data: Partial<IngredientFormState>,
  outletId?: string,
): Promise<Ingredient> {
  const response = await axiosInstance.patch<{ data: Ingredient }>(
    `/ingredients/${id}`,
    { ...data, ...(outletId && { outletId }) },
  );
  return response.data.data;
}

export async function deleteIngredient(
  id: string,
  outletId?: string,
): Promise<void> {
  await axiosInstance.delete(`/ingredients/${id}`, outletParams(outletId));
}
