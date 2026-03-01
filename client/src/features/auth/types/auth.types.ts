import type { User } from "../../users/types/user.types";

export interface LoginResponse {
  user: User;
  mustChangePassword: boolean;
}
