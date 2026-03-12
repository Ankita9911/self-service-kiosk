import axiosInstance from "@/shared/lib/axiosInstance";
import type { Ingredient, IngredientFormState, StockAdjustPayload } from "../types/ingredient.types";

function outletParams(outletId?: string) {
  return outletId ? { params: { outletId } } : {};
}

export async function getIngredients(
  outletId?: string,
  options?: { search?: string; unit?: string; lowStock?: boolean; cursor?: string; limit?: number }
): Promise<{
  items: Ingredient[];
  pagination: { limit: number; hasNext: boolean; nextCursor: string | null; totalMatching: number };
}> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  if (options?.search?.trim()) p.search = options.search.trim();
  if (options?.unit) p.unit = options.unit;
  if (options?.lowStock) p.lowStock = "true";
  if (options?.cursor) p.cursor = options.cursor;
  if (typeof options?.limit === "number") p.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: Ingredient[];
    meta?: {
      pagination?: {
        limit?: number;
        hasNext?: boolean;
        nextCursor?: string | null;
        totalMatching?: number;
      };
    };
  }>("/ingredients", { params: p });

  const pagination = response.data.meta?.pagination ?? {};

  return {
    items: response.data.data,
    pagination: {
      limit: pagination.limit ?? 20,
      hasNext: pagination.hasNext ?? false,
      nextCursor: pagination.nextCursor ?? null,
      totalMatching: pagination.totalMatching ?? response.data.data.length,
    },
  };
}

export async function getIngredientById(id: string, outletId?: string): Promise<Ingredient> {
  const response = await axiosInstance.get<{ data: Ingredient }>(
    `/ingredients/${id}`,
    outletParams(outletId)
  );
  return response.data.data;
}

export async function createIngredient(data: IngredientFormState, outletId?: string): Promise<Ingredient> {
  const response = await axiosInstance.post<{ data: Ingredient }>(
    "/ingredients",
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function updateIngredient(
  id: string,
  data: Partial<IngredientFormState>,
  outletId?: string
): Promise<Ingredient> {
  const response = await axiosInstance.patch<{ data: Ingredient }>(
    `/ingredients/${id}`,
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function deleteIngredient(id: string, outletId?: string): Promise<void> {
  await axiosInstance.delete(`/ingredients/${id}`, outletParams(outletId));
}

export async function adjustStock(
  id: string,
  data: StockAdjustPayload,
  outletId?: string
): Promise<Ingredient> {
  const response = await axiosInstance.patch<{ data: Ingredient }>(
    `/ingredients/${id}/stock`,
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}
