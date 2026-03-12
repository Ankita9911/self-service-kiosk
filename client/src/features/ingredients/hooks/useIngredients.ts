import { useEffect, useState, useCallback } from "react";
import {
  getIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "@/features/ingredients/services/ingredient.service";
import { createManualTransaction } from "@/features/stockTransactions/services/stockTransaction.service";
import type { Ingredient, IngredientFormState, StockAdjustPayload } from "@/features/ingredients/types/ingredient.types";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { useOutletEvents } from "@/shared/hooks/useOutletEvents";

export function useIngredients(outletId: string | undefined, search?: string) {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalMatching, setTotalMatching] = useState(0);
  const debouncedSearch = useDebounce(search ?? "", 400);

  const fetchIngredients = useCallback(
    async (silent = false) => {
      if (!outletId) return;
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const result = await getIngredients(outletId, {
          search: debouncedSearch || undefined,
          limit: 100,
        });
        setIngredients(result.items);
        setTotalMatching(result.pagination.totalMatching);
      } catch {
        // errors handled by axiosInstance interceptor
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [outletId, debouncedSearch]
  );

  useEffect(() => {
    fetchIngredients();
  }, [fetchIngredients]);

  useOutletEvents(["ingredient:updated", "inventory:updated"], () => {
    void fetchIngredients(true);
  }, outletId);

  async function handleCreate(data: IngredientFormState) {
    const result = await createIngredient(data, outletId);
    await fetchIngredients(true);
    return result;
  }

  async function handleUpdate(id: string, data: Partial<IngredientFormState>) {
    const result = await updateIngredient(id, data, outletId);
    await fetchIngredients(true);
    return result;
  }

  async function handleDelete(id: string) {
    await deleteIngredient(id, outletId);
    await fetchIngredients(true);
  }

  async function handleAdjustStock(id: string, data: StockAdjustPayload) {
    const result = await createManualTransaction(
      {
        ingredientId: id,
        type: data.type,
        quantity: data.type === "ADJUSTMENT" ? data.quantity : Math.abs(data.quantity),
        note: data.note,
      },
      outletId
    );
    await fetchIngredients(true);
    return result;
  }

  return {
    ingredients,
    loading,
    refreshing,
    totalMatching,
    fetchIngredients,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleAdjustStock,
  };
}
