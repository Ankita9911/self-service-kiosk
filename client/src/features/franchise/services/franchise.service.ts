import axiosInstance from "@/shared/lib/axiosInstance";
import type { Franchise } from "@/features/franchise/types/franchise.types";

export interface FranchiseFilterParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
}

export interface CreateFranchiseDTO {
  name: string;
  brandCode: string;
  contactEmail?: string;
  contactPhone?: string;
}

export async function getFranchises(params: FranchiseFilterParams = {}): Promise<Franchise[]> {
  const query: Record<string, string> = {};
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "ALL") query.status = params.status;

  const response = await axiosInstance.get("/franchises", { params: query });
  return response.data.data;
}

export async function getFranchiseById(id: string): Promise<Franchise> {
  const response = await axiosInstance.post("/franchises/get-one", { id });
  return response.data.data;
}

export async function createFranchise(
  payload: CreateFranchiseDTO
): Promise<Franchise> {
  const response = await axiosInstance.post("/franchises", payload);
  return response.data.data;
}

export async function updateFranchise(
  id: string,
  payload: Partial<Franchise>
): Promise<Franchise> {
  const response = await axiosInstance.put(`/franchises/${id}`, payload);

  return response.data.data;
}
export async function deleteFranchise(id: string): Promise<void> {
  await axiosInstance.delete(`/franchises/${id}`);
}

export async function setFranchiseStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE"
): Promise<Franchise> {
  const response = await axiosInstance.patch(`/franchises/${id}/status`, { status });
  return response.data.data;
}