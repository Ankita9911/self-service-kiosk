export interface Device {
  _id: string;
  franchiseId: string;
  outletId: string;
  deviceId: string;
  name?: string;
  status: string;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
}
