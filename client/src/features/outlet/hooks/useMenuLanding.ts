import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { PERMISSIONS } from "@/shared/lib/permissions";
import { useDebounce } from "@/shared/hooks/useDebounce";

export interface MenuLandingFilters {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

export function useMenuLanding(
  user: any,
  hasPermission: (permission: string) => boolean,
  filters: MenuLandingFilters
) {
  const navigate = useNavigate();
  const [allOutlets, setAllOutlets] = useState<Outlet[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);

  const canFetch =
    (user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN") &&
    hasPermission(PERMISSIONS.MENU_MANAGE);

  const debouncedSearch = useDebounce(filters.search, 300);
  const isMounted = useRef(false);

  // Initial full fetch for accurate stats
  const fetchAll = useCallback(async () => {
    if (!canFetch) return;
    const list = await getOutlets();
    setAllOutlets(list);
    setLoading(false);
  }, [canFetch]);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.MENU_MANAGE)) {
      navigate("/");
      return;
    }
    if (user?.role === "OUTLET_MANAGER" && user?.outletId) {
      navigate(`/outlets/${user.outletId}/menu`, { replace: true });
      return;
    }
    if (canFetch) {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [user?.role, user?.outletId, hasPermission, navigate, canFetch, fetchAll]);

  // Filtered fetch — re-runs when debounced search or status changes
  useEffect(() => {
    if (!canFetch) return;
    let cancelled = false;

    async function fetchFiltered() {
      if (!isMounted.current) { isMounted.current = true; return; } // skip on mount (fetchAll handles it)
      try {
        const result = await getOutlets({
          search: debouncedSearch,
          status: filters.status,
        });
        if (!cancelled) setOutlets(result);
      } catch {}
    }

    fetchFiltered();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch, debouncedSearch, filters.status]);

  // Sync outlets from allOutlets on initial load (no active filter)
  useEffect(() => {
    if (allOutlets.length > 0 && outlets.length === 0 && !filters.search && filters.status === "ALL") {
      setOutlets(allOutlets);
    }
  }, [allOutlets, outlets.length, filters.search, filters.status]);

  return { outlets, allOutlets, loading };
}