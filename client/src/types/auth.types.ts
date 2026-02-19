import type { User } from "./user.types";

export interface LoginResponse {
  token: string;
  user: User;
  mustChangePassword:boolean;
}
