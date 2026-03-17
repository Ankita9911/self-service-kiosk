import { useEffect, useState, useCallback } from "react";
import { getOrderStats } from "../services/order.service";
import type { OrderHistoryFilters, OrderStats } from "../types/order.types";
import { useDebounce } from "@/shared/hooks/useDebounce";

export function useOrderStats(filters: Partial<OrderHistoryFilters>) {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);
  const debouncedSearch = useDebounce(filters.search ?? "", 400);

  // Stable string key — any filter change triggers a new fetch
  const filterKey = [
    filters.date ?? "",
    filters.period ?? "",
    debouncedSearch,
    filters.franchiseId ?? "",
    filters.outletId ?? "",
    filters.status ?? "",
    filters.paymentMethod ?? "",
    refreshTick,
  ].join("|");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    getOrderStats({
      date:          filters.date,
      period:        filters.period,
      search:        debouncedSearch,
      franchiseId:   filters.franchiseId,
      outletId:      filters.outletId,
      status:        filters.status,
      paymentMethod: filters.paymentMethod,
    })
      .then((data) => { if (!cancelled) setStats(data); })
      .catch(() => { if (!cancelled) setStats(null); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const refresh = useCallback(() => setRefreshTick((n) => n + 1), []);

  return { stats, loading, refresh };
}
