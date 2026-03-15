import { useEffect, useState, useCallback, useRef } from "react";
import {
  getDevicesPage,
  createDevice,
  updateDevice,
  deleteDevice,
  changeDeviceStatus,
} from "@/features/device/services/device.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { Device } from "@/features/device/types/device.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

const DEFAULT_PAGE_SIZE = 10;

export interface DeviceFilters {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
  franchiseId: string;
  outletId: string;
}

export function useDevices(canView: boolean, filters: DeviceFilters) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const [totalDevices, setTotalDevices] = useState(0);
  const [activeDevices, setActiveDevices] = useState(0);
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

  const fetchOutlets = useCallback(async () => {
    if (!canView) return;
    const result = await getOutlets().catch(() => []);
    setOutlets(result);
  }, [canView]);

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  useEffect(() => {
    if (!canView) return;
    let cancelled = false;

    async function fetchPage() {
      const firstLoad = !hasLoadedPageRef.current;
      if (firstLoad) setLoading(true);
      else setFilterLoading(true);

      try {
        const result = await getDevicesPage(
          {
            search: debouncedSearch,
            status: filters.status,
            franchiseId: filters.franchiseId,
            outletId: filters.outletId,
          },
          {
            cursor: currentCursor ?? undefined,
            limit: pageSize,
          },
        );

        if (cancelled) return;

        setDevices(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalDevices(result.stats.totalItems);
        setActiveDevices(result.stats.activeItems);
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
  }, [
    canView,
    debouncedSearch,
    filters.status,
    filters.franchiseId,
    filters.outletId,
    currentCursor,
    pageSize,
    refreshTick,
  ]);

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

  const refreshAll = useCallback(
    async (silent = false) => {
      if (!canView) return;
      if (silent) setRefreshing(true);
      await fetchOutlets();
      resetToFirstPage();
      setRefreshTick((n) => n + 1);
    },
    [canView, fetchOutlets],
  );

  async function handleCreate(payload: {
    outletId: string;
    name?: string;
    landingImage?: string;
    landingTitle?: string;
    landingSubtitle?: string;
  }) {
    const result = await createDevice(payload);
    return result.secret;
  }

  async function handleUpdate(deviceId: string, name: string) {
    await updateDevice(deviceId, { name });
    await refreshAll(true);
  }

  async function handleDelete(deviceId: string) {
    await deleteDevice(deviceId);
    await refreshAll(true);
  }

  async function handleStatusChange(
    deviceId: string,
    status: "ACTIVE" | "INACTIVE",
  ) {
    await changeDeviceStatus(deviceId, status);
    await refreshAll(true);
  }

  return {
    devices,
    outlets,
    loading,
    refreshing,
    filterLoading,
    totalDevices,
    activeDevices,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize: updatePageSize,
    resetToFirstPage,
    fetchData: refreshAll,
    handleCreate,
    handleDelete,
    handleUpdate,
    handleStatusChange,
  };
}
