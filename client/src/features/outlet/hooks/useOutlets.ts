import { useEffect, useState } from "react";
import { getOutlets, createOutlet, updateOutlet, deleteOutlet } from "@/features/outlet/services/outlet.service";
import { getFranchises } from "@/features/franchise/services/franchise.service";
import type { Outlet, OutletAddress } from "@/features/outlet/types/outlet.types";
import type { Franchise } from "@/features/franchise/types/franchise.types";

type OutletForm = {
  franchiseId: string;
  name: string;
  outletCode: string;
  address: OutletAddress;
};

export function useOutlets(isSuperAdmin: boolean, canViewOutlet: boolean) {
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchData(silent = false) {
    if (!canViewOutlet) return;
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const outletData = await getOutlets();
      setOutlets(outletData);

      if (isSuperAdmin) {
        const franchiseData = await getFranchises();
        setFranchises(franchiseData);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  async function handleSubmit(
    editing: Outlet | null,
    form: OutletForm
  ) {
    if (editing) await updateOutlet(editing._id, form);
    else await createOutlet(form);
    await fetchData(true);
  }

  async function handleDelete(id: string) {
    await deleteOutlet(id);
    await fetchData(true);
  }

  return {
    outlets,
    franchises,
    loading,
    refreshing,
    fetchData,
    handleSubmit,
    handleDelete,
  };
}