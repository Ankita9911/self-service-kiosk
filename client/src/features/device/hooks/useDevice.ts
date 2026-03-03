import { useEffect, useState, useCallback, useRef } from "react";
import {
  getDevices,
  createDevice,
  updateDevice,
  deleteDevice,
  changeDeviceStatus,
} from "@/features/device/services/device.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { Device } from "@/features/device/types/device.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

export interface DeviceFilters {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
  franchiseId: string;
  outletId: string;
}

export function useDevices(canView: boolean, filters: DeviceFilters) {
  // Table data — re-fetched from backend whenever filters change
  const [devices, setDevices] = useState<Device[]>([]);
  // Full unfiltered list — for stats in DeviceStats
  const [allDevices, setAllDevices] = useState<Device[]>([]);

  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);

  // ── Stats + outlets fetch (no filters) — runs on mount + after mutations ──
  const fetchAll = useCallback(
    async (silent = false) => {
      if (!canView) return;
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const [deviceList, outletList] = await Promise.all([
          getDevices(),
          getOutlets(),
        ]);
        setAllDevices(deviceList);
        setOutlets(outletList);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canView],
  );

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filtered fetch (table) — re-runs whenever filters change ─────────────
  const isMounted = useRef(false);

  useEffect(() => {
    if (!canView) return;
    let cancelled = false;

    async function fetchFiltered() {
      if (isMounted.current) setFilterLoading(true);
      else isMounted.current = true;

      try {
        const result = await getDevices({
          search: debouncedSearch,
          status: filters.status,
          franchiseId: filters.franchiseId,
          outletId: filters.outletId,
        });
        if (!cancelled) setDevices(result);
      } finally {
        if (!cancelled) setFilterLoading(false);
      }
    }

    fetchFiltered();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView, debouncedSearch, filters.status, filters.franchiseId, filters.outletId]);

  // ── Helper to re-fetch table after a mutation ─────────────────────────────
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; });

  const refreshFiltered = useCallback(async () => {
    if (!canView) return;
    const f = filtersRef.current;
    const result = await getDevices({
      search: f.search,
      status: f.status,
      franchiseId: f.franchiseId,
      outletId: f.outletId,
    });
    setDevices(result);
  }, [canView]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  async function handleCreate(payload: { outletId: string; name?: string; landingImage?: string; landingTitle?: string; landingSubtitle?: string }) {
    const result = await createDevice(payload);
    return result.secret;
  }

  async function handleUpdate(deviceId: string, name: string) {
    await updateDevice(deviceId, { name });
    await Promise.all([fetchAll(true), refreshFiltered()]);
  }

  async function handleDelete(deviceId: string) {
    await deleteDevice(deviceId);
    await Promise.all([fetchAll(true), refreshFiltered()]);
  }

  async function handleStatusChange(deviceId: string, status: "ACTIVE" | "INACTIVE") {
    await changeDeviceStatus(deviceId, status);
    await Promise.all([fetchAll(true), refreshFiltered()]);
  }

  return {
    devices,      // filtered list — for the table
    allDevices,   // full list — for stats
    outlets,
    loading,
    refreshing,
    filterLoading,
    fetchData: fetchAll,
    handleCreate,
    handleDelete,
    handleUpdate,
    handleStatusChange,
  };
}
