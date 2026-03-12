import axiosInstance from "@/shared/lib/axiosInstance";
import type { StockTransaction, ManualTransactionPayload } from "../types/stockTransaction.types";

export async function getStockTransactions(
  outletId?: string,
  options?: { ingredientId?: string; type?: string; cursor?: string; limit?: number }
): Promise<{
  items: StockTransaction[];
  pagination: { limit: number; hasNext: boolean; nextCursor: string | null; totalMatching: number };
}> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  if (options?.ingredientId) p.ingredientId = options.ingredientId;
  if (options?.type) p.type = options.type;
  if (options?.cursor) p.cursor = options.cursor;
  if (typeof options?.limit === "number") p.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: StockTransaction[];
    meta?: {
      pagination?: {
        limit?: number;
        hasNext?: boolean;
        nextCursor?: string | null;
        totalMatching?: number;
      };
    };
  }>("/stock-transactions", { params: p });

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

export async function getIngredientHistory(
  ingredientId: string,
  outletId?: string,
  options?: { cursor?: string; limit?: number }
): Promise<{
  items: StockTransaction[];
  pagination: { limit: number; hasNext: boolean; nextCursor: string | null; totalMatching: number };
}> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  if (options?.cursor) p.cursor = options.cursor;
  if (typeof options?.limit === "number") p.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: StockTransaction[];
    meta?: {
      pagination?: {
        limit?: number;
        hasNext?: boolean;
        nextCursor?: string | null;
        totalMatching?: number;
      };
    };
  }>(`/stock-transactions/${ingredientId}/history`, { params: p });

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

export async function createManualTransaction(
  data: ManualTransactionPayload,
  outletId?: string
): Promise<StockTransaction> {
  const response = await axiosInstance.post<{ data: StockTransaction }>(
    "/stock-transactions",
    { ...data, ...(outletId && { outletId }) }
  );
  return response.data.data;
}
