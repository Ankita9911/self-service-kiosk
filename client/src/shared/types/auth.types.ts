import type { User } from "../../features/users/types/user.types";

export interface LoginResponse {
  token: string;
  user: User;
  mustChangePassword:boolean;
}
