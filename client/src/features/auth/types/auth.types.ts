import type { User } from "../../users/types/user.types";

export interface LoginResponse {
  token: string;
  user: User;
  mustChangePassword:boolean;
}
