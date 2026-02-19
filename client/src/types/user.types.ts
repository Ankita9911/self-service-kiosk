export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  franchiseId: string | null;
  outletId: string | null;
}
