import axios from "@/shared/lib/axiosInstance";
import type { LoginResponse } from "@/features/auth/types/auth.types";

export async function loginRequest(email: string, password: string) {
  const response = await axios.post<{ data: LoginResponse }>("/auth/login", {
    email,
    password,
  });

  return response.data.data;
}

export async function forceResetPassword(data: {
  currentPassword: string;
  password: string;
}) {
  return axios.post("/auth/force-reset-password", data);
}
