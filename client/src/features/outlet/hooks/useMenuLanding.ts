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
  const [searching, setSearching] = useState(false);

  const canFetch =
    (user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN") &&
    hasPermission(PERMISSIONS.MENU_MANAGE);

  // Debounce the search term so backend is only queried after the user stops typing
  const debouncedSearch = useDebounce(filters.search, 400);

  // Track whether the initial load has completed so the search effect can skip it
  const initialLoadDone = useRef(false);

  // Auth / redirect gate
  useEffect(() => {
    if (!hasPermission(PERMISSIONS.MENU_MANAGE)) {
      navigate("/");
      return;
    }
    if (user?.role === "OUTLET_MANAGER" && user?.outletId) {
      navigate(`/outlets/${user.outletId}/menu`, { replace: true });
    }
  }, [user?.role, user?.outletId, hasPermission, navigate]);

  // Initial load — fetch all outlets (no filters) once to populate stats + default list
  const fetchAll = useCallback(async () => {
    if (!canFetch) return;
    try {
      const list = await getOutlets();
      setAllOutlets(list);
      setOutlets(list);
    } finally {
      initialLoadDone.current = true;
      setLoading(false);
    }
  }, [canFetch]);

  useEffect(() => {
    if (canFetch) {
      fetchAll();
    } else {
      setLoading(false);
    }
  }, [canFetch, fetchAll]);

  // Backend search — fires whenever debounced search term or status filter changes.
  // Skipped on the very first render so fetchAll handles the initial list.
  useEffect(() => {
    if (!canFetch || !initialLoadDone.current) return;

    let cancelled = false;
    setSearching(true);

    getOutlets({ search: debouncedSearch, status: filters.status })
      .then((result) => { if (!cancelled) setOutlets(result); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setSearching(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canFetch, debouncedSearch, filters.status]);

  return { outlets, allOutlets, loading, searching };
}