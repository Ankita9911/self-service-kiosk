export type DeviceStatus = "ACTIVE" | "INACTIVE";
export interface Device {
  _id: string;
  franchiseId: string;
  outletId: string;
  deviceId: string;
  name?: string;
  status: DeviceStatus;
  lastSeenAt?: string;
  createdAt: string;
  updatedAt: string;
  landingImage?: string;
  landingTitle?: string;
  landingSubtitle?: string;
}
