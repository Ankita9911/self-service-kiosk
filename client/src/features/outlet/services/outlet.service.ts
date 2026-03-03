import axiosInstance from "@/shared/lib/axiosInstance";
import type { Outlet, OutletAddress } from "@/features/outlet/types/outlet.types";

export interface OutletFilterParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  franchiseId?: string;
}

export async function getOutlets(params: OutletFilterParams = {}): Promise<Outlet[]> {
  const query: Record<string, string> = {};
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "ALL") query.status = params.status;
  if (params.franchiseId && params.franchiseId !== "ALL") query.franchiseId = params.franchiseId;

  const response = await axiosInstance.get("/outlets", { params: query });
  return response.data.data;
}

export async function createOutlet(payload: {
  franchiseId?: string;
  name: string;
  outletCode: string;
  address?: OutletAddress;
}) {
  const response = await axiosInstance.post("/outlets", payload);
  return response.data.data;
}

export async function updateOutlet(
  id: string,
  payload: Partial<Outlet>
) {
  const response = await axiosInstance.put(`/outlets/${id}`,payload);

  return response.data.data;
}

export async function deleteOutlet(id: string) {
  const response = await axiosInstance.delete(`/outlets/${id}`);
  return response.data.data;
}

export async function setOutletStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<Outlet> {
  const response = await axiosInstance.patch(`/outlets/${id}/status`, { status });
  return response.data.data;
}

export async function getOutletById(id: string) {
  const response = await axiosInstance.post(
    "/outlets/get-one",
    { id }
  );

  return response.data.data;
}
