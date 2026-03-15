import { useEffect, useState, useCallback, useRef } from "react";
import {
  getUsersPage,
  createUser,
  updateUser,
  deleteUser,
  changeUserRole,
  changeUserStatus,
  resetUserPassword,
} from "@/features/users/services/user.service";
import { getFranchises } from "@/features/franchise/services/franchise.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import { useDebounce } from "@/shared/hooks/useDebounce";
import type { User } from "@/features/users/types/user.types";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

const DEFAULT_PAGE_SIZE = 10;

export interface UserFilters {
  search: string;
  role: string;
  franchiseId: string;
  outletId: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

export function useUsers(filters: UserFilters) {
  const [users, setUsers] = useState<User[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsers, setActiveUsers] = useState(0);
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

  const fetchLookupData = useCallback(async () => {
    const [franchiseList, outletList] = await Promise.all([
      getFranchises().catch(() => []),
      getOutlets({ franchiseId: filters.franchiseId }).catch(() => []),
    ]);
    setFranchises(franchiseList);
    setOutlets(outletList);
  }, [filters.franchiseId]);

  useEffect(() => {
    fetchLookupData();
  }, [fetchLookupData]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPage() {
      const firstLoad = !hasLoadedPageRef.current;
      if (firstLoad) setLoading(true);
      else setFilterLoading(true);

      try {
        const result = await getUsersPage(
          {
            search: debouncedSearch,
            role: filters.role,
            franchiseId: filters.franchiseId,
            outletId: filters.outletId,
            status: filters.status,
          },
          {
            cursor: currentCursor ?? undefined,
            limit: pageSize,
          }
        );

        if (cancelled) return;

        setUsers(result.items);
        setHasNextPage(result.pagination.hasNext);
        setNextCursor(result.pagination.nextCursor);
        setTotalMatching(result.pagination.totalMatching);
        setTotalUsers(result.stats.totalItems);
        setActiveUsers(result.stats.activeItems);
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
    debouncedSearch,
    filters.role,
    filters.franchiseId,
    filters.outletId,
    filters.status,
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

  const refreshAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    await fetchLookupData();
    resetToFirstPage();
    setRefreshTick((n) => n + 1);
  }, [fetchLookupData]);

  async function handleCreate(payload: Parameters<typeof createUser>[0]): Promise<string> {
    const result = await createUser(payload);
    await refreshAll(true);
    return result.tempPassword;
  }

  async function handleUpdate(id: string, payload: { name?: string; email?: string }) {
    await updateUser(id, payload);
    await refreshAll(true);
  }

  async function handleDelete(id: string) {
    await deleteUser(id);
    await refreshAll(true);
  }

  async function handleChangeRole(id: string, role: string) {
    await changeUserRole(id, role);
    await refreshAll(true);
  }

  async function handleChangeStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    await changeUserStatus(id, status);
    await refreshAll(true);
  }

  async function handleResetPassword(id: string): Promise<string> {
    return resetUserPassword(id);
  }

  return {
    users,
    franchises,
    outlets,
    loading,
    refreshing,
    filterLoading,
    totalUsers,
    activeUsers,
    totalMatching,
    page,
    pageSize,
    hasPrevPage,
    hasNextPage,
    goToNextPage,
    goToPrevPage,
    setPageSize: updatePageSize,
    resetToFirstPage,
    fetchUsers: refreshAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleChangeRole,
    handleChangeStatus,
    handleResetPassword,
  };
}
