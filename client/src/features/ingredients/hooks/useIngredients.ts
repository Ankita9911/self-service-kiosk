import { useEffect, useState, useCallback, useRef } from "react";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "@/features/ingredients/services/ingredient.service";
import { createManualTransaction } from "@/features/stockTransactions/services/stockTransaction.service";
import type {
  Ingredient,
  IngredientFormState,
  StockAdjustPayload,
} from "@/features/ingredients/types/ingredient.types";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useOutletEvents } from "@/shared/hooks/useOutletEvents";

const DEFAULT_PAGE_SIZE = 10;

export interface IngredientFilters {
  search: string;
  unit: string;   // "ALL" | "gram" | "ml" | "piece" | "kg" | "liter" | "dozen"
  lowStock: boolean;
  sortBy: string;    // "createdAt" | "currentStock" | "minThreshold" | "name"
  sortOrder: string; // "asc" | "desc"
}

const DEFAULT_FILTERS: IngredientFilters = {
  search: "",
  unit: "ALL",
  lowStock: false,
  sortBy: "createdAt",
  sortOrder: "desc",
};

export function useIngredients(
  outletId: string | undefined,
  filters: IngredientFilters = DEFAULT_FILTERS,
  actionOutletId?: string,
  allowFranchiseScope = false
) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats — always reflect the full dataset (no filters applied)
  const [totalItems, setTotalItems] = useState(0);
  const [lowStockItems, setLowStockItems] = useState(0);

  // Cursor pagination
  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalMatching, setTotalMatching] = useState(0);
  const [pageSize, setPageSizeState] = useState(DEFAULT_PAGE_SIZE);
  const [refreshTick, setRefreshTick] = useState(0);

  const hasLoadedRef = useRef(false);

  const debouncedSearch = useDebounce(filters.search, 400);
  const currentCursor = cursorStack[cursorStack.length - 1] ?? undefined;
  const page = cursorStack.length;
  const hasPrevPage = page > 1;

  const fetchIngredients = useCallback(
    async (silent = false) => {
      if (!outletId && !allowFranchiseScope) return;
      const firstLoad = !hasLoadedRef.current;
      if (silent) setRefreshing(true);
      else if (firstLoad) setLoading(true);

      try {
        const result = await getIngredients(outletId, {
          search: debouncedSearch || undefined,
          unit: filters.unit !== "ALL" ? filters.unit : undefined,
          lowStock: filters.lowStock || undefined,
          cursor: currentCursor,
          limit: pageSize,
          sortBy: filters.sortBy !== "createdAt" ? filters.sortBy : undefined,
          sortOrder: filters.sortOrder !== "desc" ? filters.sortOrder : undefined,
        });

        setIngredients(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalItems(result.stats.totalItems);
        setLowStockItems(result.stats.lowStockItems);
      } catch {
        // handled by axios interceptor
      } finally {
        hasLoadedRef.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outletId, debouncedSearch, filters.unit, filters.lowStock, filters.sortBy, filters.sortOrder, currentCursor, pageSize, refreshTick]
  );

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  useOutletEvents(
    ["ingredient:updated", "inventory:updated"],
    () => { void fetchIngredients(true); },
    outletId
  );

  // ── Navigation ──
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

  const refreshAll = useCallback(async (silent = false) => {
    if (!outletId && !allowFranchiseScope) return;
    if (silent) setRefreshing(true);
    resetToFirstPage();
    setRefreshTick((n) => n + 1);
  }, [allowFranchiseScope, outletId]);

  // ── CRUD ──
  async function handleCreate(data: IngredientFormState) {
    const result = await createIngredient(data, actionOutletId ?? outletId);
    await refreshAll(true);
    return result;
  }

  async function handleUpdate(id: string, data: Partial<IngredientFormState>) {
    const result = await updateIngredient(id, data, actionOutletId ?? outletId);
    await refreshAll(true);
    return result;
  }

  async function handleDelete(id: string) {
    await deleteIngredient(id, actionOutletId ?? outletId);
    await refreshAll(true);
  }

  async function handleAdjustStock(id: string, data: StockAdjustPayload) {
    const result = await createManualTransaction(
      {
        ingredientId: id,
        type: data.type,
        quantity: data.type === "ADJUSTMENT" ? data.quantity : Math.abs(data.quantity),
        note: data.note,
      },
      actionOutletId ?? outletId
    );
    await refreshAll(true);
    return result;
  }

  return {
    ingredients,
    loading,
    refreshing,
    totalItems,
    lowStockItems,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    fetchData: refreshAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAdjustStock,
  };
}
