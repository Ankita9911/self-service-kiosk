import { useState, useEffect, useCallback } from "react";
import { fetchAnalyticsOverview } from "../service/analytics.service";
import type { AnalyticsData } from "../types/analytics.types";

export function useAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriodState] = useState<string>("");

    const load = useCallback(async (p?: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAnalyticsOverview(p || undefined);
            setData(result);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to load analytics";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const setPeriod = useCallback((p: string) => {
        setPeriodState(p);
        load(p);
    }, [load]);

    useEffect(() => {
        load();
    }, [load]);

    return { data, loading, error, period, setPeriod, refetch: () => load(period || undefined) };
}
