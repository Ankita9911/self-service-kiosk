import { useEffect, useState, useCallback } from "react";
import type { Franchise } from "../types/franchise.types";
import type { CreateFranchiseDTO } from "../services/franchise.service";

import {
  getFranchises,
  createFranchise,
  updateFranchise,
  deleteFranchise,
} from "../services/franchise.service";

export function useFranchises() {
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const fetchFranchises = useCallback(
    async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const data = await getFranchises();
        setFranchises(data);
      } catch (error) {
        console.error("Failed to fetch franchises:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchFranchises();
  }, [fetchFranchises]);

  async function handleCreate(data: CreateFranchiseDTO) {
    try {
      await createFranchise(data);
      await fetchFranchises(true);
    } catch (error) {
      console.error("Failed to create franchise:", error);
      throw error;
    }
  }

  async function handleUpdate(id: string, data: Partial<Franchise>) {
    try {
      await updateFranchise(id, data);
      await fetchFranchises(true);
    } catch (error) {
      console.error("Failed to update franchise:", error);
      throw error;
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteFranchise(id);
      await fetchFranchises(true);
    } catch (error) {
      console.error("Failed to delete franchise:", error);
      throw error;
    }
  }

  return {
    franchises,
    loading,
    refreshing,
    fetchFranchises,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}