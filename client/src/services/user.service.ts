import axios from "@/services/axiosInstance";
import type { User } from "@/types/user.types";

export async function getUsers(): Promise<User[]> {
  const response = await axios.get<{ data: User[] }>("/users");
  return response.data.data;
}
