import { useEffect, useState, useCallback, useRef } from "react";
import type { Franchise } from "../types/franchise.types";
import type { CreateFranchiseDTO } from "../services/franchise.service";
import {
  getFranchises,
  createFranchise,
  updateFranchise,
  deleteFranchise,
  setFranchiseStatus,
} from "../services/franchise.service";
import { useDebounce } from "@/shared/hooks/useDebounce";

export interface FranchiseFilters {
  search: string;
  status: "ALL" | "ACTIVE" | "INACTIVE";
}

export function useFranchises(filters: FranchiseFilters) {
  // Filtered list for the table
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  // Full unfiltered list for stats
  const [allFranchises, setAllFranchises] = useState<Franchise[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);

  // ── Stats fetch (no filters) — runs on mount + after every mutation ────────
  const fetchAll = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await getFranchises();
      setAllFranchises(data);
    } catch (error) {
      console.error("Failed to fetch franchises:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Filtered fetch (table) — re-runs whenever filters change ─────────────
  const isMounted = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchFiltered() {
      if (isMounted.current) setFilterLoading(true);
      else isMounted.current = true;

      try {
        const result = await getFranchises({
          search: debouncedSearch,
          status: filters.status,
        });
        if (!cancelled) setFranchises(result);
      } catch (error) {
        console.error("Failed to fetch filtered franchises:", error);
      } finally {
        if (!cancelled) setFilterLoading(false);
      }
    }

    fetchFiltered();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filters.status]);

  // ── Helper to re-fetch table with current filters after a mutation ────────
  const filtersRef = useRef(filters);
  useEffect(() => { filtersRef.current = filters; });

  const refreshFiltered = useCallback(async () => {
    const f = filtersRef.current;
    const result = await getFranchises({ search: f.search, status: f.status });
    setFranchises(result);
  }, []);

  // ── Mutations ──────────────────────────────────────────────────────────────
  async function handleCreate(data: CreateFranchiseDTO) {
    try {
      await createFranchise(data);
      await Promise.all([fetchAll(true), refreshFiltered()]);
    } catch (error) {
      console.error("Failed to create franchise:", error);
      throw error;
    }
  }

  async function handleUpdate(id: string, data: Partial<Franchise>) {
    try {
      await updateFranchise(id, data);
      await Promise.all([fetchAll(true), refreshFiltered()]);
    } catch (error) {
      console.error("Failed to update franchise:", error);
      throw error;
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFranchise(id);
      await Promise.all([fetchAll(true), refreshFiltered()]);
    } catch (error) {
      console.error("Failed to delete franchise:", error);
      throw error;
    }
  }

  async function handleSetStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    try {
      await setFranchiseStatus(id, status);
      await Promise.all([fetchAll(true), refreshFiltered()]);
    } catch (error) {
      console.error("Failed to update franchise status:", error);
      throw error;
    }
  }

  return {
    franchises,     // filtered list — for the table
    allFranchises,  // full list — for stats
    loading,
    refreshing,
    filterLoading,
    fetchFranchises: fetchAll,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleSetStatus,
  };
}
