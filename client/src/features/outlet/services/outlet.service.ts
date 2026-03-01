import axiosInstance from "@/shared/lib/axiosInstance";
import type { Outlet, OutletAddress } from "@/features/outlet/types/outlet.types";

export async function getOutlets(): Promise<Outlet[]> {
  const response = await axiosInstance.get("/outlets");
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
