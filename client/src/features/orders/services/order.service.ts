import axiosInstance from "@/shared/lib/axiosInstance";
import type {
  OrderHistoryItem,
  OrderHistoryFilters,
  OrderStats,
} from "../types/order.types";

export interface OrdersPageResult {
  items: OrderHistoryItem[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
    totalMatching: number;
  };
}

function buildParams(
  filters: Partial<OrderHistoryFilters>,
  extra: Record<string, string> = {},
): Record<string, string> {
  const p: Record<string, string> = { ...extra };
  if (filters.date) { p.date = filters.date; } else if (filters.period) { p.period = filters.period; }
  if (filters.status && filters.status !== "ALL") p.status = filters.status;
  if (filters.paymentMethod && filters.paymentMethod !== "ALL") p.paymentMethod = filters.paymentMethod;
  if (filters.search?.trim()) p.search = filters.search.trim();
  if (filters.franchiseId && filters.franchiseId !== "ALL") p.franchiseId = filters.franchiseId;
  if (filters.outletId && filters.outletId !== "ALL") p.outletId = filters.outletId;
  return p;
}

export async function getOrdersPage(
  filters: Partial<OrderHistoryFilters>,
  cursor?: string,
  limit = 20,
): Promise<OrdersPageResult> {
  const params = buildParams(filters, { limit: String(limit) });
  if (cursor) params.cursor = cursor;

  const response = await axiosInstance.get<{
    data: OrderHistoryItem[];
    meta: { pagination: OrdersPageResult["pagination"] };
  }>("/orders/history", { params });

  return {
    items: response.data.data,
    pagination: response.data.meta.pagination,
  };
}

export async function getOrderById(id: string): Promise<OrderHistoryItem> {
  const response = await axiosInstance.get<{ data: OrderHistoryItem }>(
    `/orders/history/${id}`,
  );
  return response.data.data;
}

export async function getOrderStats(
  filters: Partial<OrderHistoryFilters>,
): Promise<OrderStats> {
  const params = buildParams(filters);
  const response = await axiosInstance.get<{ data: OrderStats }>(
    "/orders/stats",
    { params },
  );
  return response.data.data;
}
