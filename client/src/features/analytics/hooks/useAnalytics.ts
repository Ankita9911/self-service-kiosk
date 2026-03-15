import { useState, useEffect, useCallback } from "react";
import { fetchAnalyticsOverview } from "../services/analytics.service";
import type { AnalyticsData } from "../types/analytics.types";

export function useAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriodState] = useState<string>("");

  const load = useCallback(async (p?: string) => {
    setLoading(true);
    try {
      const result = await fetchAnalyticsOverview(p || undefined);
      setData(result);
    } catch {
      // axios interceptor handles error toasts
    } finally {
      setLoading(false);
    }
  }, []);

  const setPeriod = useCallback(
    (p: string) => {
      setPeriodState(p);
      load(p);
    },
    [load]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    period,
    setPeriod,
    refetch: () => load(period || undefined),
  };
}
