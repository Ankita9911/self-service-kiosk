import { useEffect, useState, useCallback, useRef } from "react";
import {
  getStockTransactionsPage,
  createManualTransaction,
} from "@/features/stockTransactions/services/stockTransaction.service";
import type {
  StockTransaction,
  ManualTransactionPayload,
  StockTransactionStats,
  StockTransactionSortBy,
  StockTransactionSortOrder,
} from "@/features/stockTransactions/types/stockTransaction.types";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useOutletEvents } from "@/shared/hooks/useOutletEvents";

const DEFAULT_PAGE_SIZE = 20;

export interface StockTransactionFilters {
  search: string;
  ingredientId: string;
  type: string;
  sortBy: StockTransactionSortBy;
  sortOrder: StockTransactionSortOrder;
}

const DEFAULT_FILTERS: StockTransactionFilters = {
  search: "",
  ingredientId: "",
  type: "",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const DEFAULT_STATS: StockTransactionStats = {
  totalTransactions: 0,
  purchaseCount: 0,
  consumptionCount: 0,
  wastageCount: 0,
  adjustmentCount: 0,
};

export function useStockTransactions(
  outletId: string | undefined,
  filters: StockTransactionFilters = DEFAULT_FILTERS,
  actionOutletId?: string,
  allowFranchiseScope = false
) {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [stats, setStats] = useState<StockTransactionStats>(DEFAULT_STATS);

  const [totalMatching, setTotalMatching] = useState(0);
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);
  const [refreshTick, setRefreshTick] = useState(0);

  const hasLoadedRef = useRef(false);
  const debouncedSearch = useDebounce(filters.search, 400);

  const currentCursor = cursorStack[cursorStack.length - 1] ?? undefined;
  const page = cursorStack.length;
  const hasPrevPage = page > 1;

  const fetchTransactions = useCallback(
    async (silent = false) => {
      if (!outletId && !allowFranchiseScope) return;
      const firstLoad = !hasLoadedRef.current;
      if (silent) setRefreshing(true);
      else if (firstLoad) setLoading(true);
      else setFilterLoading(true);

      try {
        const result = await getStockTransactionsPage(
          outletId,
          {
            search: debouncedSearch || undefined,
            ingredientId: filters.ingredientId || undefined,
            type: filters.type || undefined,
            sortBy: filters.sortBy,
            sortOrder: filters.sortOrder,
          },
          {
            cursor: currentCursor,
            limit: pageSize,
          }
        );
        setTransactions(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setStats(result.stats);
      } catch {
        // errors handled by axiosInstance interceptor
      } finally {
        hasLoadedRef.current = true;
        setLoading(false);
        setRefreshing(false);
        setFilterLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      outletId,
      debouncedSearch,
      filters.ingredientId,
      filters.type,
      filters.sortBy,
      filters.sortOrder,
      currentCursor,
      pageSize,
      refreshTick,
    ]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useOutletEvents(
    ["stock-transactions:updated"],
    () => {
      void fetchTransactions(true);
    },
    outletId
  );

  function goToNextPage() {
    if (!hasNextPage || !nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  }

  function goToPrevPage() {
    setCursorStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function resetToFirstPage() {
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }

  function setPageSize(size: number) {
    setPageSizeState(size);
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }

  const refreshAll = useCallback(
    (silent = false) => {
      if (!outletId && !allowFranchiseScope) return;
      if (silent) setRefreshing(true);
      resetToFirstPage();
      setRefreshTick((n) => n + 1);
    },
    [allowFranchiseScope, outletId]
  );

  async function handleCreate(data: ManualTransactionPayload) {
    const result = await createManualTransaction(data, actionOutletId ?? outletId);
    refreshAll(true);
    return result;
  }

  return {
    transactions,
    loading,
    refreshing,
    filterLoading,
    stats,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    refreshAll,
    fetchTransactions,
    handleCreate,
  };
}
