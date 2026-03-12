import { useEffect, useState, useCallback } from "react";
import {
  getStockTransactions,
  createManualTransaction,
} from "@/features/stockTransactions/services/stockTransaction.service";
import type { StockTransaction, ManualTransactionPayload } from "@/features/stockTransactions/types/stockTransaction.types";
import { useOutletEvents } from "@/shared/hooks/useOutletEvents";

export function useStockTransactions(
  outletId: string | undefined,
  filters?: { ingredientId?: string; type?: string }
) {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalMatching, setTotalMatching] = useState(0);

  const fetchTransactions = useCallback(
    async (silent = false) => {
      if (!outletId) return;
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const result = await getStockTransactions(outletId, {
          ingredientId: filters?.ingredientId,
          type: filters?.type,
          limit: 50,
        });
        setTransactions(result.items);
        setTotalMatching(result.pagination.totalMatching);
      } catch {
        // errors handled by axiosInstance interceptor
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [outletId, filters?.ingredientId, filters?.type]
  );

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useOutletEvents(["stock-transactions:updated"], () => {
    void fetchTransactions(true);
  }, outletId);

  async function handleCreate(data: ManualTransactionPayload) {
    const result = await createManualTransaction(data, outletId);
    await fetchTransactions(true);
    return result;
  }

  return {
    transactions,
    loading,
    refreshing,
    totalMatching,
    fetchTransactions,
    handleCreate,
  };
}
