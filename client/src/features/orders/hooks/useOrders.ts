import { useEffect, useState, useCallback, useRef } from "react";
import { getOrdersPage } from "../services/order.service";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { OrderHistoryItem, OrderHistoryFilters } from "../types/order.types";

const DEFAULT_PAGE_SIZE = 10;

export function useOrders(filters: OrderHistoryFilters) {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
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

  // Build a stable key from all filter values — changing any field triggers a refetch
  const filterKey = [
    filters.date,
    filters.period,
    filters.status,
    filters.paymentMethod,
    filters.franchiseId,
    filters.outletId,
    debouncedSearch,
    currentCursor,
    pageSize,
    refreshTick,
  ].join("|");

  useEffect(() => {
    let cancelled = false;

    async function fetchPage() {
      const firstLoad = !hasLoadedRef.current;
      if (firstLoad) setLoading(true);
      else setFilterLoading(true);

      try {
        const result = await getOrdersPage(
          {
            date:          filters.date,
            period:        filters.period,
            status:        filters.status,
            paymentMethod: filters.paymentMethod,
            franchiseId:   filters.franchiseId,
            outletId:      filters.outletId,
            search:        debouncedSearch,
          },
          currentCursor ?? undefined,
          pageSize,
        );
        if (cancelled) return;
        setOrders(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
      } finally {
        if (!cancelled) {
          hasLoadedRef.current = true;
          setLoading(false);
          setRefreshing(false);
          setFilterLoading(false);
        }
      }
    }

    fetchPage();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  function goToNextPage() {
    if (!hasNextPage || !nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  }

  function goToPrevPage() {
    setCursorStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  const resetToFirstPage = useCallback(() => {
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    resetToFirstPage();
  }, [resetToFirstPage]);

  const refresh = useCallback((silent = false) => {
    if (silent) setRefreshing(true);
    resetToFirstPage();
    setRefreshTick((n) => n + 1);
  }, [resetToFirstPage]);

  return {
    orders,
    loading,
    refreshing,
    filterLoading,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    refresh,
  };
}
