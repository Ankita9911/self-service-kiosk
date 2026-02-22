export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: "ACTIVE" | "INACTIVE";
  franchiseId?: string | null;
  outletId?: string | null;
  mustChangePassword?: boolean;
}
