import { useEffect, useState, useCallback, useRef } from "react";
import type { Franchise } from "../types/franchise.types";
import type { CreateFranchiseDTO } from "../services/franchise.service";
import {
  getFranchisesPage,
  createFranchise,
  updateFranchise,
  deleteFranchise,
  setFranchiseStatus,
} from "../services/franchise.service";
import { useDebounce } from "@/shared/hooks/useDebounce";

const DEFAULT_PAGE_SIZE = 10;

export interface FranchiseFilters {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

export function useFranchises(filters: FranchiseFilters) {
  const [franchises, setFranchises] = useState<Franchise[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const [totalFranchises, setTotalFranchises] = useState(0);
  const [activeFranchises, setActiveFranchises] = useState(0);
  const [totalMatching, setTotalMatching] = useState(0);

  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [refreshTick, setRefreshTick] = useState(0);

  const hasLoadedPageRef = useRef(false);

  const debouncedSearch = useDebounce(filters.search, 400);
  const currentCursor = cursorStack[cursorStack.length - 1] ?? undefined;
  const page = cursorStack.length;
  const hasPrevPage = page > 1;

  useEffect(() => {
    let cancelled = false;

    async function fetchPage() {
      const firstLoad = !hasLoadedPageRef.current;
      if (firstLoad) setLoading(true);
      else setFilterLoading(true);

      try {
        const result = await getFranchisesPage(
          {
            search: debouncedSearch,
            status: filters.status,
          },
          {
            cursor: currentCursor ?? undefined,
            limit: pageSize,
          }
        );

        if (cancelled) return;

        setFranchises(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalFranchises(result.stats.totalItems);
        setActiveFranchises(result.stats.activeItems);
      } finally {
        if (cancelled) return;
        hasLoadedPageRef.current = true;
        setLoading(false);
        setRefreshing(false);
        setFilterLoading(false);
      }
    }

    fetchPage();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, filters.status, currentCursor, pageSize, refreshTick]);

  function goToNextPage() {
    if (!hasNextPage || !nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  }

  function goToPrevPage() {
    setCursorStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  function updatePageSize(size: number) {
    setPageSize(size);
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }

  function resetToFirstPage() {
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }

  const refreshAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    resetToFirstPage();
    setRefreshTick((n) => n + 1);
  }, []);

  async function handleCreate(data: CreateFranchiseDTO) {
    await createFranchise(data);
    await refreshAll(true);
  }

  async function handleUpdate(id: string, data: Partial<Franchise>) {
    await updateFranchise(id, data);
    await refreshAll(true);
  }

  async function handleDelete(id: string) {
    await deleteFranchise(id);
    await refreshAll(true);
  }

  async function handleSetStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    await setFranchiseStatus(id, status);
    await refreshAll(true);
  }

  return {
    franchises,
    loading,
    refreshing,
    filterLoading,
    totalFranchises,
    activeFranchises,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize: updatePageSize,
    resetToFirstPage,
    fetchFranchises: refreshAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSetStatus,
  };
}
