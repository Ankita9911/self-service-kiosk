import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOutletsPage } from "@/features/outlet/services/outlet.service";
import type { Outlet } from "@/features/outlet/types/outlet.types";
import { PERMISSIONS } from "@/shared/lib/permissions";
import { useDebounce } from "@/shared/hooks/useDebounce";

const PAGE_SIZE = 3;

export interface MenuLandingFilters {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

export function useMenuLanding(
  user: any,
  hasPermission: (permission: string) => boolean,
  filters: MenuLandingFilters,
) {
  const navigate = useNavigate();
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const [totalOutlets, setTotalOutlets] = useState(0);
  const [activeOutlets, setActiveOutlets] = useState(0);
  const [totalMatching, setTotalMatching] = useState(0);

  const [cursorStack, setCursorStack] = useState<(string | null)[]>([null]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const canFetch =
    (user?.role === "FRANCHISE_ADMIN" || user?.role === "SUPER_ADMIN") &&
    hasPermission(PERMISSIONS.MENU_MANAGE);

  const debouncedSearch = useDebounce(filters.search, 400);
  const hasLoadedPageRef = useRef(false);
  const currentCursor = cursorStack[cursorStack.length - 1] ?? undefined;
  const page = cursorStack.length;
  const hasPrevPage = page > 1;

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.MENU_MANAGE)) {
      navigate("/");
      return;
    }
    if (user?.role === "OUTLET_MANAGER" && user?.outletId) {
      navigate(`/outlets/${user.outletId}/menu`, { replace: true });
    }
  }, [user?.role, user?.outletId, hasPermission, navigate]);

  useEffect(() => {
    if (!canFetch) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function fetchPage() {
      const firstLoad = !hasLoadedPageRef.current;
      if (!firstLoad) setSearching(true);

      try {
        const result = await getOutletsPage(
          {
            search: debouncedSearch,
            status: filters.status,
          },
          {
            cursor: currentCursor ?? undefined,
            limit: PAGE_SIZE,
          },
        );

        if (cancelled) return;

        setOutlets(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalOutlets(result.stats.totalItems);
        setActiveOutlets(result.stats.activeItems);
      } finally {
        if (cancelled) return;
        hasLoadedPageRef.current = true;
        setLoading(false);
        setSearching(false);
      }
    }

    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [canFetch, debouncedSearch, filters.status, currentCursor]);

  const resetToFirstPage = useCallback(() => {
    setCursorStack([null]);
    setNextCursor(null);
    setHasNextPage(false);
  }, []);

  function goToNextPage() {
    if (!hasNextPage || !nextCursor) return;
    setCursorStack((prev) => [...prev, nextCursor]);
  }

  function goToPrevPage() {
    setCursorStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }

  return {
    outlets,
    loading,
    searching,
    totalOutlets,
    activeOutlets,
    totalMatching,
    page,
    hasPrevPage,
    hasNextPage,
    goToPrevPage,
    goToNextPage,
    resetToFirstPage,
  };
}
