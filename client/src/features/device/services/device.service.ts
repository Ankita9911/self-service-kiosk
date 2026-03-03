import axiosInstance from "@/shared/lib/axiosInstance";
import type { Device } from "@/features/device/types/device.types";

export interface DeviceFilterParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  franchiseId?: string;
  outletId?: string;
}

export interface CursorPageOptions {
  cursor?: string;
  limit?: number;
}

export interface PaginatedDevicesResult {
  items: Device[];
  pagination: {
    limit: number;
    hasNext: boolean;
    nextCursor: string | null;
    totalMatching: number;
  };
  stats: {
    totalItems: number;
    activeItems: number;
  };
}

export async function getDevicesPage(
  params: DeviceFilterParams = {},
  options: CursorPageOptions = {}
): Promise<PaginatedDevicesResult> {
  const query: Record<string, string> = {};
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "ALL") query.status = params.status;
  if (params.franchiseId && params.franchiseId !== "ALL") query.franchiseId = params.franchiseId;
  if (params.outletId && params.outletId !== "ALL") query.outletId = params.outletId;
  if (options.cursor) query.cursor = options.cursor;
  if (typeof options.limit === "number") query.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: Device[];
    meta?: {
      pagination?: {
        limit?: number;
        hasNext?: boolean;
        nextCursor?: string | null;
        totalMatching?: number;
      };
      stats?: {
        totalItems?: number;
        activeItems?: number;
      };
    };
  }>("/devices", { params: query });

  const pagination = response.data.meta?.pagination ?? {};
  const stats = response.data.meta?.stats ?? {};

  return {
    items: response.data.data,
    pagination: {
      limit: pagination.limit ?? options.limit ?? 10,
      hasNext: pagination.hasNext ?? false,
      nextCursor: pagination.nextCursor ?? null,
      totalMatching: pagination.totalMatching ?? response.data.data.length,
    },
    stats: {
      totalItems: stats.totalItems ?? response.data.data.length,
      activeItems: stats.activeItems ?? response.data.data.filter((d) => d.status === "ACTIVE").length,
    },
  };
}

export async function getDevices(params: DeviceFilterParams = {}): Promise<Device[]> {
  const allDevices: Device[] = [];
  let cursor: string | undefined;

  while (true) {
    const page = await getDevicesPage(params, { cursor, limit: 100 });
    allDevices.push(...page.items);
    if (!page.pagination.hasNext || !page.pagination.nextCursor) break;
    cursor = page.pagination.nextCursor;
  }

  return allDevices;
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
