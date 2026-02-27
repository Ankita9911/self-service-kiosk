import { useEffect, useState, useCallback } from "react";
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
import type { User } from "@/features/users/types/user.types";
import type { Franchise } from "@/features/franchise/types/franchise.types";
import type { Outlet } from "@/features/outlet/types/outlet.types";

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
    await fetchUsers(true);
    return result.tempPassword;
  }

  async function handleUpdate(id: string, payload: { name?: string; email?: string }) {
    await updateUser(id, payload);
    await fetchUsers(true);
  }

  async function handleDelete(id: string) {
    await deleteUser(id);
    await fetchUsers(true);
  }

  async function handleChangeRole(id: string, role: string) {
    await changeUserRole(id, role);
    await fetchUsers(true);
  }

  async function handleChangeStatus(id: string, status: "ACTIVE" | "INACTIVE") {
    await changeUserStatus(id, status);
    await fetchUsers(true);
  }

  async function handleResetPassword(id: string): Promise<string> {
    const tempPassword = await resetUserPassword(id);
    return tempPassword;
  }

  return {
    users,
    franchises,
    outlets,
    loading,
    refreshing,
    fetchUsers,
    handleCreate,
    handleUpdate,
    handleDelete,
    handleChangeRole,
    handleChangeStatus,
    handleResetPassword,
  };
}