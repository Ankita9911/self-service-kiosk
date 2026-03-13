import kioskAxios from "@/shared/lib/kioskAxios";
import type { MenuItem } from "../types/menu.types";

// ─── Shared recommendation item shape ────────────────────────────────────────

export interface RecommendedItem extends MenuItem {
  totalSold?: number;
  coOccurrenceCount?: number;
}

export interface ComboDeal {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  items: { menuItemId: string; name: string; quantity: number }[];
  originalPrice: number;
  comboPrice: number;
  serviceType: string;
  overlapCount: number;
}

export interface CompleteMealResult {
  suggestions: RecommendedItem[];
  comboDeal: ComboDeal | null;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchTrending(options?: {
  windowHours?: number;
  limit?: number;
}): Promise<RecommendedItem[]> {
  const params: Record<string, string> = {};
  if (options?.windowHours) params.windowHours = String(options.windowHours);
  if (options?.limit) params.limit = String(options.limit);

  const response = await kioskAxios.get<{ data: RecommendedItem[] }>(
    "/kiosk/recommendations/trending",
    { params }
  );
  return response.data.data;
}

export async function fetchFrequentlyBoughtTogether(
  itemIds: string[],
  options?: { limit?: number; windowDays?: number }
): Promise<RecommendedItem[]> {
  if (!itemIds.length) return [];

  const params: Record<string, string> = { itemIds: itemIds.join(",") };
  if (options?.limit) params.limit = String(options.limit);
  if (options?.windowDays) params.windowDays = String(options.windowDays);

  const response = await kioskAxios.get<{ data: RecommendedItem[] }>(
    "/kiosk/recommendations/frequently-bought-together",
    { params }
  );
  return response.data.data;
}

export async function fetchCompleteMeal(
  cartItemIds: string[],
  cartCategoryIds: string[],
  options?: { limit?: number; windowDays?: number }
): Promise<CompleteMealResult> {
  const params: Record<string, string> = {};
  if (cartItemIds.length) params.cartItemIds = cartItemIds.join(",");
  if (cartCategoryIds.length) params.cartCategoryIds = cartCategoryIds.join(",");
  if (options?.limit) params.limit = String(options.limit);
  if (options?.windowDays) params.windowDays = String(options.windowDays);

  const response = await kioskAxios.get<{ data: CompleteMealResult }>(
    "/kiosk/recommendations/complete-meal",
    { params }
  );
  return response.data.data;
}
