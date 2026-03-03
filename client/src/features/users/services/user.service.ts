import axios from "@/shared/lib/axiosInstance";
import type { User } from "@/features/users/types/user.types";

export interface UserFilterParams {
  search?: string;
  role?: string;
  franchiseId?: string;
  outletId?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
}

export async function getUsers(params: UserFilterParams = {}): Promise<User[]> {
  const query: Record<string, string> = {};
  if (params.search?.trim())   query.search      = params.search.trim();
  if (params.role      && params.role      !== "ALL") query.role      = params.role;
  if (params.franchiseId && params.franchiseId !== "ALL") query.franchiseId = params.franchiseId;
  if (params.outletId  && params.outletId  !== "ALL") query.outletId  = params.outletId;
  if (params.status    && params.status    !== "ALL") query.status    = params.status;

  const response = await axios.get<{ data: User[] }>("/users", { params: query });
  return response.data.data;
}

export async function createUser(payload: {
  name: string;
  email: string;
  role: string;
  franchiseId?: string;
  outletId?: string;
}) {
  const response = await axios.post("/users", payload);
  return response.data.data;
}

export async function updateUser(id: string, payload: { name?: string; email?: string }): Promise<User> {
  const response = await axios.patch<{ data: User }>(`/users/${id}`, payload);
  return response.data.data;
}

export async function deleteUser(id: string): Promise<void> {
  await axios.delete(`/users/${id}`);
}

export async function changeUserRole(id: string, role: string): Promise<User> {
  const response = await axios.patch<{ data: User }>(`/users/${id}/role`, { role });
  return response.data.data;
}

export async function changeUserStatus(id: string, status: "ACTIVE" | "INACTIVE"): Promise<User> {
  const response = await axios.patch<{ data: User }>(`/users/${id}/status`, { status });
  return response.data.data;
}

function generateTempPassword(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function resetUserPassword(id: string): Promise<string> {
  const tempPassword = generateTempPassword();
  await axios.post(`/users/${id}/reset-password`, { password: tempPassword });
  return tempPassword;
}
