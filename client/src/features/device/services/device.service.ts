import axiosInstance from "@/shared/lib/axiosInstance";
import type { Device } from "@/features/device/types/device.types";

export interface DeviceFilterParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  franchiseId?: string;
  outletId?: string;
}

export async function getDevices(params: DeviceFilterParams = {}): Promise<Device[]> {
  const query: Record<string, string> = {};
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "ALL") query.status = params.status;
  if (params.franchiseId && params.franchiseId !== "ALL") query.franchiseId = params.franchiseId;
  if (params.outletId && params.outletId !== "ALL") query.outletId = params.outletId;

  const response = await axiosInstance.get<{ data: Device[] }>("/devices", { params: query });
  return response.data.data;
}

export async function createDevice(payload: {
  outletId: string;
  name?: string;
  landingImage?: string;
  landingTitle?: string;
  landingSubtitle?: string;
}): Promise<{ device: Device; secret: string }> {
  const response = await axiosInstance.post<{
    data: { device: Device; secret: string };
  }>("/devices", payload);
  return response.data.data;
}

export async function updateDevice(
  deviceId: string,
  payload: { name?: string }
): Promise<Device> {
  const response = await axiosInstance.patch<{ data: Device }>(
    `/devices/${deviceId}`,
    payload
  );
  return response.data.data;
}

export async function deleteDevice(deviceId: string): Promise<void> {
  await axiosInstance.delete(`/devices/${deviceId}`);
}

export async function changeDeviceStatus(
  deviceId: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<Device> {
  const response = await axiosInstance.patch<{ data: Device }>(
    `/devices/${deviceId}/status`,
    { status }
  );
  return response.data.data;
}

export async function kioskLogin(
  deviceId: string,
  password: string
): Promise<{ token: string; landingImage: string | null; landingTitle: string | null; landingSubtitle: string | null }> {
  const response = await axiosInstance.post<{ data: { token: string; landingImage: string | null; landingTitle: string | null; landingSubtitle: string | null } }>(
    "/devices/login",
    { deviceId, password }
  );
  return response.data.data;
}

