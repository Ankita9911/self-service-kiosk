import { useState, useEffect, useCallback } from "react";
import { fetchAnalyticsOverview } from "../service/analytics.service";
import type { AnalyticsData } from "../types/analytics.types";

export function useAnalytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAnalyticsOverview();
            setData(result);
        } catch (err: unknown) {
            const message =
                err instanceof Error ? err.message : "Failed to load analytics";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    return { data, loading, error, refetch: load };
}
