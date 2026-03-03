import { useEffect, useState, useCallback, useRef } from "react";
import {
  getUsers,
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

export interface UserFilters {
  search: string;
  role: string;
  franchiseId: string;
  outletId: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

export function useUsers(filters: UserFilters) {
  // Table data — re-fetched from backend whenever filters change
  const [users, setUsers] = useState<User[]>([]);
  // Full unfiltered list — used only for stats (total / active / inactive)
  const [allUsers, setAllUsers] = useState<User[]>([]);

  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  // Debounce the search term; all other filters are applied immediately
  const debouncedSearch = useDebounce(filters.search, 400);

  // ── Stats fetch (no filters) — runs on mount + after every mutation ────────
  const fetchAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [allUserList, franchiseList, outletList] = await Promise.all([
        getUsers(),
        getFranchises().catch(() => []),
        getOutlets().catch(() => []),
      ]);
      setAllUsers(allUserList);
      setFranchises(franchiseList);
      setOutlets(outletList);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Re-fetch outlets from backend whenever franchiseId filter changes ────────
  useEffect(() => {
    getOutlets({ franchiseId: filters.franchiseId }).catch(() => []).then(setOutlets);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.franchiseId]);

  // ── Filtered fetch (table) — runs on mount + whenever a filter changes ─────
  const isMounted = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchFiltered() {
      if (isMounted.current) setFilterLoading(true);
      else isMounted.current = true;

      try {
        const result = await getUsers({
          search: debouncedSearch,
          role: filters.role,
          franchiseId: filters.franchiseId,
          outletId: filters.outletId,
          status: filters.status,
        });
        if (!cancelled) setUsers(result);
      } finally {
        if (!cancelled) setFilterLoading(false);
      }
    }

    fetchFiltered();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.role, filters.franchiseId, filters.outletId, filters.status]);

  // ── Helpers used after mutations to keep table in sync ────────────────────
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; });

  const refreshFiltered = useCallback(async () => {
    const f = filtersRef.current;
    const result = await getUsers({
      search: f.search,
      role: f.role,
      franchiseId: f.franchiseId,
      outletId: f.outletId,
      status: f.status,
    });
    setUsers(result);
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────
  async function handleCreate(payload: any) {
    const result = await createUser(payload);
    await Promise.all([fetchAll(true), refreshFiltered()]);
    return result.tempPassword;
  }

  async function handleUpdate(id: string, payload: { name?: string; email?: string }) {
    await updateUser(id, payload);
    await Promise.all([fetchAll(true), refreshFiltered()]);
  }

  async function handleDelete(id: string) {
    await deleteUser(id);
    await Promise.all([fetchAll(true), refreshFiltered()]);
  }

  async function handleChangeRole(id: string, role: string) {
    await changeUserRole(id, role);
    await Promise.all([fetchAll(true), refreshFiltered()]);
  }

  async function handleChangeStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    await changeUserStatus(id, status);
    await Promise.all([fetchAll(true), refreshFiltered()]);
  }

  async function handleResetPassword(id: string): Promise<string> {
    return resetUserPassword(id);
  }

  return {
    users,        // filtered list — for the table
    allUsers,     // full list — for stats
    franchises,
    outlets,
    loading,
    refreshing,
    filterLoading,
    fetchUsers: fetchAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleChangeRole,
    handleChangeStatus,
    handleResetPassword,
  };
}