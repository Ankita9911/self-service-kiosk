import { useEffect, useState, useCallback } from "react";
import { getUsers, createUser } from "@/features/users/services/user.service";
import { getFranchises } from "@/features/franchise/services/franchise.service";
import { getOutlets } from "@/features/outlet/services/outlet.service";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    try {
      const [userList, franchiseList, outletList] = await Promise.all([
        getUsers(),
        getFranchises().catch(() => []),
        getOutlets().catch(() => []),
      ]);

      setUsers(userList);
      setFranchises(franchiseList);
      setOutlets(outletList);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleCreate(payload: any) {
    const result = await createUser(payload);
    return result.tempPassword;
  }

  return {
    users,
    franchises,
    outlets,
    loading,
    refreshing,
    fetchUsers,
    handleCreate,
  };
}