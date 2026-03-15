import axiosInstance from "@/shared/lib/axiosInstance";
import type {
  StockTransaction,
  ManualTransactionPayload,
  StockTransactionStats,
  StockTransactionSortBy,
  StockTransactionSortOrder,
} from "../types/stockTransaction.types";

export interface StockTransactionFilterParams {
  ingredientId?: string;
  type?: string;
  search?: string;
  sortBy?: StockTransactionSortBy;
  sortOrder?: StockTransactionSortOrder;
}

export interface StockTransactionPageOptions {
  cursor?: string;
  limit?: number;
}

export interface PaginatedStockTransactionsResult {
  items: StockTransaction[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
    totalMatching: number;
  };
  stats: StockTransactionStats;
}

export async function getStockTransactionsPage(
  outletId?: string,
  params: StockTransactionFilterParams = {},
  options: StockTransactionPageOptions = {},
): Promise<PaginatedStockTransactionsResult> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  if (params.ingredientId) p.ingredientId = params.ingredientId;
  if (params.type) p.type = params.type;
  if (params.search?.trim()) p.search = params.search.trim();
  if (params.sortBy) p.sortBy = params.sortBy;
  if (params.sortOrder) p.sortOrder = params.sortOrder;
  if (options.cursor) p.cursor = options.cursor;
  if (typeof options.limit === "number") p.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: StockTransaction[];
    meta?: {
      pagination?: {
        limit?: number;
        hasNext?: boolean;
        nextCursor?: string | null;
        totalMatching?: number;
      };
      stats?: {
        totalTransactions?: number;
        purchaseCount?: number;
        consumptionCount?: number;
        wastageCount?: number;
        adjustmentCount?: number;
      };
    };
  }>("/stock-transactions", { params: p });

  const pagination = response.data.meta?.pagination ?? {};
  const stats = response.data.meta?.stats ?? {};

  return {
    items: response.data.data,
    pagination: {
      limit: pagination.limit ?? options.limit ?? 20,
      hasNext: pagination.hasNext ?? false,
      nextCursor: pagination.nextCursor ?? null,
      totalMatching: pagination.totalMatching ?? response.data.data.length,
    },
    stats: {
      totalTransactions: stats.totalTransactions ?? response.data.data.length,
      purchaseCount: stats.purchaseCount ?? 0,
      consumptionCount: stats.consumptionCount ?? 0,
      wastageCount: stats.wastageCount ?? 0,
      adjustmentCount: stats.adjustmentCount ?? 0,
    },
  };
}

// Keep legacy name for backward compat (used by getIngredientHistory flow)
export async function getStockTransactions(
  outletId?: string,
  options?: {
    ingredientId?: string;
    type?: string;
    cursor?: string;
    limit?: number;
  },
): Promise<{
  items: StockTransaction[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
    totalMatching: number;
  };
}> {
  const result = await getStockTransactionsPage(
    outletId,
    {
      ingredientId: options?.ingredientId,
      type: options?.type,
    },
    {
      cursor: options?.cursor,
      limit: options?.limit,
    },
  );
  return { items: result.items, pagination: result.pagination };
}

export async function getIngredientHistory(
  ingredientId: string,
  outletId?: string,
  options?: { cursor?: string; limit?: number },
): Promise<{
  items: StockTransaction[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
    totalMatching: number;
  };
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
  outletId?: string,
): Promise<StockTransaction> {
  const p: Record<string, string> = {};
  if (outletId) p.outletId = outletId;
  const response = await axiosInstance.post<{ data: StockTransaction }>(
    "/stock-transactions",
    data,
    { params: p },
  );
  return response.data.data;
}
