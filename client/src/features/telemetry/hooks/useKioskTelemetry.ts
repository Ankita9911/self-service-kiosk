import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useDebounce } from "@/shared/hooks/useDebounce";
import {
  fetchKioskTelemetryComponents,
  fetchKioskTelemetryDevices,
  fetchKioskTelemetryErrors,
  fetchKioskTelemetryFunnel,
  fetchKioskTelemetryOverview,
  fetchKioskTelemetryPages,
  fetchKioskTelemetryStatus,
  fetchKioskTelemetrySessionDetail,
  fetchKioskTelemetrySessionEvents,
  fetchKioskTelemetrySessions,
} from "../services/telemetry.service";
import type {
  KioskTelemetryDashboardData,
  KioskTelemetryFilters,
  KioskTelemetrySessionDetail,
  KioskTelemetrySessionEvents,
  KioskTelemetrySessions,
} from "../types/telemetry.types";

const LIVE_DASHBOARD_CACHE_TTL_MS = 30_000;
const WEEK_DASHBOARD_CACHE_TTL_MS = 60_000;
const HISTORY_DASHBOARD_CACHE_TTL_MS = 300_000;
const SESSION_CACHE_TTL_MS = 5_000;
const DEFAULT_SESSION_PAGE_SIZE = 20;

interface SessionCacheEntry {
  detail: KioskTelemetrySessionDetail;
  events: KioskTelemetrySessionEvents;
  expiresAt: number;
}

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function createDefaultFilters(): KioskTelemetryFilters {
  const to = new Date();
  const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    from: formatDateInput(from),
    to: formatDateInput(to),
    outletId: "",
    deviceId: "",
    page: "",
    component: "",
  };
}

function serializeFilters(filters: KioskTelemetryFilters) {
  return JSON.stringify(filters);
}

function getErrorMessage(error: unknown) {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response &&
    error.response.data &&
    typeof error.response.data === "object" &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  return error instanceof Error
    ? error.message
    : "Failed to load kiosk telemetry";
}

function getRangeMs(filters: KioskTelemetryFilters) {
  const from = new Date(filters.from);
  const to = new Date(filters.to);

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  return Math.max(0, to.getTime() - from.getTime());
}

function getDashboardCacheTtlMs(filters: KioskTelemetryFilters) {
  const rangeDays = getRangeMs(filters) / (24 * 60 * 60 * 1000);

  if (rangeDays <= 1.1) return LIVE_DASHBOARD_CACHE_TTL_MS;
  if (rangeDays <= 7.1) return WEEK_DASHBOARD_CACHE_TTL_MS;
  return HISTORY_DASHBOARD_CACHE_TTL_MS;
}

export function useKioskTelemetry() {
  const [filters, setFilters] = useState<KioskTelemetryFilters>(
    createDefaultFilters,
  );
  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<KioskTelemetryDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMoreSessions, setLoadingMoreSessions] = useState(false);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );
  const [sessionDetail, setSessionDetail] =
    useState<KioskTelemetrySessionDetail | null>(null);
  const [sessionEvents, setSessionEvents] =
    useState<KioskTelemetrySessionEvents | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const dataRef = useRef<KioskTelemetryDashboardData | null>(null);
  const dashboardCacheRef = useRef(
    new Map<string, { expiresAt: number; data: KioskTelemetryDashboardData }>(),
  );
  const sessionCacheRef = useRef(new Map<string, SessionCacheEntry>());
  const dashboardRequestRef = useRef(0);
  const sessionRequestRef = useRef(0);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const loadDashboard = useCallback(
    async (currentFilters: KioskTelemetryFilters, force = false) => {
      const cacheKey = serializeFilters(currentFilters);
      const cacheTtlMs = getDashboardCacheTtlMs(currentFilters);
      const cached = dashboardCacheRef.current.get(cacheKey);

      if (cached && cached.expiresAt > Date.now() && !force) {
        startTransition(() => {
          setData(cached.data);
          setError(null);
          setLoading(false);
          setRefreshing(false);
        });
        return;
      }

      const requestId = ++dashboardRequestRef.current;
      setError(null);
      if (dataRef.current) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const [
          overview,
          status,
          funnel,
          pages,
          components,
          devices,
          errors,
          sessions,
        ] = await Promise.all([
          fetchKioskTelemetryOverview(currentFilters),
          fetchKioskTelemetryStatus(currentFilters),
          fetchKioskTelemetryFunnel(currentFilters),
          fetchKioskTelemetryPages(currentFilters),
          fetchKioskTelemetryComponents(currentFilters),
          fetchKioskTelemetryDevices(currentFilters),
          fetchKioskTelemetryErrors(currentFilters),
          fetchKioskTelemetrySessions({
            ...currentFilters,
            limit: DEFAULT_SESSION_PAGE_SIZE,
          }),
        ]);

        if (requestId === dashboardRequestRef.current) {
          const nextData: KioskTelemetryDashboardData = {
          overview,
          status,
          funnel,
          pages,
            components,
            devices,
            errors,
            sessions,
          };

          dashboardCacheRef.current.set(cacheKey, {
            expiresAt: Date.now() + cacheTtlMs,
            data: nextData,
          });

          startTransition(() => {
            setData(nextData);
            setError(null);
          });
        }
      } catch (nextError) {
        if (requestId === dashboardRequestRef.current) {
          setError(getErrorMessage(nextError));
        }
      } finally {
        if (requestId === dashboardRequestRef.current) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    },
    [],
  );

  useEffect(() => {
    void loadDashboard(debouncedFilters);
  }, [debouncedFilters, loadDashboard]);

  const loadSession = useCallback(async (visitorSessionId: string) => {
    const cached = sessionCacheRef.current.get(visitorSessionId);

    if (cached && cached.expiresAt > Date.now()) {
      startTransition(() => {
        setSessionDetail(cached.detail);
        setSessionEvents(cached.events);
        setSessionError(null);
        setSessionLoading(false);
      });
      return;
    }

    const requestId = ++sessionRequestRef.current;
    setSessionLoading(true);
    setSessionError(null);

    try {
      const [detail, events] = await Promise.all([
        fetchKioskTelemetrySessionDetail(visitorSessionId),
        fetchKioskTelemetrySessionEvents(visitorSessionId),
      ]);

      if (requestId === sessionRequestRef.current) {
        sessionCacheRef.current.set(visitorSessionId, {
          detail,
          events,
          expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
        });

        startTransition(() => {
          setSessionDetail(detail);
          setSessionEvents(events);
        });
      }
    } catch (nextError) {
      if (requestId === sessionRequestRef.current) {
        setSessionError(getErrorMessage(nextError));
      }
    } finally {
      if (requestId === sessionRequestRef.current) {
        setSessionLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;
    void loadSession(selectedSessionId);
  }, [selectedSessionId, loadSession]);

  async function loadMoreSessions() {
    if (!data?.sessions.pagination.hasNext || !data.sessions.pagination.nextCursor) {
      return;
    }

    setLoadingMoreSessions(true);

    try {
      const nextSessions = await fetchKioskTelemetrySessions({
        ...debouncedFilters,
        limit: data.sessions.pagination.limit,
        cursor: data.sessions.pagination.nextCursor,
      });

      setData((current) => {
        if (!current) return current;

        const mergedSessions: KioskTelemetrySessions = {
          window: nextSessions.window,
          items: [...current.sessions.items, ...nextSessions.items],
          pagination: nextSessions.pagination,
        };

        const nextData = {
          ...current,
          sessions: mergedSessions,
        };

        dashboardCacheRef.current.set(serializeFilters(debouncedFilters), {
          expiresAt: Date.now() + getDashboardCacheTtlMs(debouncedFilters),
          data: nextData,
        });

        return nextData;
      });
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setLoadingMoreSessions(false);
    }
  }

  function updateFilters(
    updater:
      | Partial<KioskTelemetryFilters>
      | ((current: KioskTelemetryFilters) => KioskTelemetryFilters),
  ) {
    setFilters((current) =>
      typeof updater === "function" ? updater(current) : { ...current, ...updater },
    );
  }

  function resetFilters() {
    setFilters(createDefaultFilters());
  }

  function refetch() {
    void loadDashboard(debouncedFilters, true);
  }

  function openSession(visitorSessionId: string) {
    setSelectedSessionId(visitorSessionId);
    setSessionDetail(null);
    setSessionEvents(null);
    setSessionError(null);
  }

  function closeSession() {
    setSelectedSessionId(null);
    setSessionDetail(null);
    setSessionEvents(null);
    setSessionError(null);
    setSessionLoading(false);
  }

  return {
    filters,
    setFilters: updateFilters,
    resetFilters,
    data,
    loading,
    refreshing,
    error,
    refetch,
    selectedSessionId,
    openSession,
    closeSession,
    sessionDetail,
    sessionEvents,
    sessionLoading,
    sessionError,
    loadMoreSessions,
    loadingMoreSessions,
  };
}
