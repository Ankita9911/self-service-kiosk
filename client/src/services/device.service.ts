import axiosInstance from "./axiosInstance";
import type { Device } from "@/types/device.types";

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
