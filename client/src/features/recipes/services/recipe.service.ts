import axiosInstance from "@/shared/lib/axiosInstance";
import type { Recipe, RecipeFormState, AISuggestion } from "../types/recipe.types";

function outletParams(outletId?: string) {
  return outletId ? { params: { outletId } } : {};
}

export async function getRecipes(
  outletId?: string,
  options?: { cursor?: string; limit?: number }
): Promise<{
  items: Recipe[];
  pagination: { limit: number; hasNext: boolean; nextCursor: string | null; totalMatching: number };
}> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  if (options?.cursor) p.cursor = options.cursor;
  if (typeof options?.limit === "number") p.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: Recipe[];
    meta?: {
      pagination?: {
        limit?: number;
        hasNext?: boolean;
        nextCursor?: string | null;
        totalMatching?: number;
      };
    };
  }>("/recipes", { params: p });

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

export async function getRecipeById(id: string, outletId?: string): Promise<Recipe> {
  const response = await axiosInstance.get<{ data: Recipe }>(
    `/recipes/${id}`,
    outletParams(outletId)
  );
  return response.data.data;
}

export async function getRecipeByMenuItem(menuItemId: string, outletId?: string): Promise<Recipe | null> {
  const response = await axiosInstance.get<{ data: Recipe | null }>(
    `/recipes/by-item/${menuItemId}`,
    outletParams(outletId)
  );
  return response.data.data;
}

export async function createRecipe(
  data: Omit<RecipeFormState, "_aiName">,
  outletId?: string
): Promise<Recipe> {
  const response = await axiosInstance.post<{ data: Recipe }>(
    "/recipes",
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function updateRecipe(
  id: string,
  data: Partial<RecipeFormState>,
  outletId?: string
): Promise<Recipe> {
  const response = await axiosInstance.patch<{ data: Recipe }>(
    `/recipes/${id}`,
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}

export async function deleteRecipe(id: string, outletId?: string): Promise<void> {
  await axiosInstance.delete(`/recipes/${id}`, outletParams(outletId));
}

export async function aiGenerateRecipe(description: string, outletId?: string): Promise<AISuggestion> {
  const response = await axiosInstance.post<{ data: AISuggestion }>(
    "/recipes/ai-generate",
    { description, ...(outletId && { outletId }) }
  );
  return response.data.data;
}
