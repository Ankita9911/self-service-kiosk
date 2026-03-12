import { useEffect, useState, useCallback, useRef } from "react";
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  aiGenerateRecipe,
} from "@/features/recipes/services/recipe.service";
import type { Recipe, RecipeFormState, AISuggestion } from "@/features/recipes/types/recipe.types";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useOutletEvents } from "@/shared/hooks/useOutletEvents";

const DEFAULT_PAGE_SIZE = 12;

export interface RecipeFilters {
  search: string;
  aiOnly: boolean;
}

const DEFAULT_FILTERS: RecipeFilters = {
  search: "",
  aiOnly: false,
};

export function useRecipes(
  outletId: string | undefined,
  filters: RecipeFilters = DEFAULT_FILTERS,
  actionOutletId?: string,
  allowFranchiseScope = false
) {
  const mutationOutletId = actionOutletId ?? outletId;
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);

  // Stats
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [aiGeneratedCount, setAiGeneratedCount] = useState(0);

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

  const fetchRecipes = useCallback(
    async (silent = false) => {
      if (!outletId && !allowFranchiseScope) return;
      const firstLoad = !hasLoadedRef.current;
      if (silent) setRefreshing(true);
      else if (firstLoad) setLoading(true);

      try {
        const result = await getRecipes(outletId, {
          search: debouncedSearch || undefined,
          aiOnly: filters.aiOnly || undefined,
          cursor: currentCursor,
          limit: pageSize,
        });
        setRecipes(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalRecipes(result.stats.totalRecipes);
        setAiGeneratedCount(result.stats.aiGeneratedCount);
      } catch {
        // errors handled by axiosInstance interceptor
      } finally {
        hasLoadedRef.current = true;
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [outletId, debouncedSearch, filters.aiOnly, currentCursor, pageSize, refreshTick]
  );

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  useOutletEvents(["recipe:updated", "inventory:updated"], () => {
    void fetchRecipes(true);
  }, outletId);

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

  const refreshAll = useCallback(
    (silent = false) => {
      if (!outletId && !allowFranchiseScope) return;
      if (silent) setRefreshing(true);
      resetToFirstPage();
      setRefreshTick((n) => n + 1);
    },
    [allowFranchiseScope, outletId]
  );

  // ── CRUD ──
  async function handleCreate(data: RecipeFormState) {
    if (!mutationOutletId) {
      throw new Error("Select an outlet to create a recipe.");
    }
    const cleanIngredients = data.ingredients
      .filter((i) => i.ingredientId)
      .map(({ ingredientId, quantity, unit }) => ({ ingredientId, quantity, unit }));

    const result = await createRecipe(
      { ...data, ingredients: cleanIngredients },
      mutationOutletId
    );
    refreshAll(true);
    return result;
  }

  async function handleUpdate(id: string, data: Partial<RecipeFormState>) {
    if (!mutationOutletId) {
      throw new Error("Select an outlet to update a recipe.");
    }
    if (data.ingredients) {
      data.ingredients = data.ingredients
        .filter((i) => i.ingredientId)
        .map(({ ingredientId, quantity, unit }) => ({ ingredientId, quantity, unit }));
    }
    const result = await updateRecipe(id, data, mutationOutletId);
    refreshAll(true);
    return result;
  }

  async function handleDelete(id: string) {
    if (!mutationOutletId) {
      throw new Error("Select an outlet to delete a recipe.");
    }
    await deleteRecipe(id, mutationOutletId);
    refreshAll(true);
  }

  async function handleAIGenerate(description: string) {
    if (!mutationOutletId) {
      throw new Error("Select an outlet to generate a recipe.");
    }
    setAiLoading(true);
    try {
      const suggestion = await aiGenerateRecipe(description, mutationOutletId);
      setAiSuggestion(suggestion);
      return suggestion;
    } catch {
      return null;
    } finally {
      setAiLoading(false);
    }
  }

  function clearAISuggestion() {
    setAiSuggestion(null);
  }

  return {
    recipes,
    loading,
    refreshing,
    aiLoading,
    aiSuggestion,
    // Stats
    totalRecipes,
    aiGeneratedCount,
    totalMatching,
    // Pagination
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize,
    resetToFirstPage,
    fetchData: refreshAll,
    // CRUD
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAIGenerate,
    clearAISuggestion,
  };
}
