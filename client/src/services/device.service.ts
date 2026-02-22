import axiosInstance from "@/shared/lib/axiosInstance";
import type { Device } from "@/shared/types/device.types";

export async function getDevices(): Promise<Device[]> {
  const response = await axiosInstance.get<{ data: Device[] }>("/devices");
  return response.data.data;
}

export async function createDevice(payload: {
  outletId: string;
  name?: string;
}): Promise<{ device: Device; secret: string }> {
  const response = await axiosInstance.post<{
    data: { device: Device; secret: string };
  }>("/devices", payload);
  return response.data.data;
}

// Used by KioskLoginPage — no auth token needed, hits the public endpoint
export async function kioskLogin(
  deviceId: string,
  password: string
): Promise<{ token: string }> {
  const response = await axiosInstance.post<{ data: { token: string } }>(
    "/devices/login",
    { deviceId, password }
  );
  return response.data.data;
}