import axios from "@/shared/lib/axiosInstance";
import type { User } from "@/shared/types/user.types";

export async function getUsers(): Promise<User[]> {
  const response = await axios.get<{ data: User[] }>("/users");
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
