import { useEffect, useState, useCallback } from "react";
import { getDevices, createDevice } from "@/features/device/services/device.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type { Device } from "@/features/device/types/device.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

export function useDevices(canView: boolean) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (silent = false) => {
      if (!canView) return;

      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const [deviceList, outletList] = await Promise.all([
          getDevices(),
          getOutlets(),
        ]);
        setDevices(deviceList);
        setOutlets(outletList);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canView]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleCreate(payload: {
    outletId: string;
    name?: string;
  }) {
    const result = await createDevice(payload);
    return result.secret;
  }

  return {
    devices,
    outlets,
    loading,
    refreshing,
    fetchData,
    handleCreate,
  };
}
