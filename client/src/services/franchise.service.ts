import axiosInstance from "@/shared/lib/axiosInstance";
import type { Franchise } from "@/shared/types/franchise.types";

export async function getFranchises(): Promise<Franchise[]> {
  const response = await axiosInstance.get("/franchises");
  return response.data.data;
}

export async function createFranchise(payload: {
  name: string;
  brandCode: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  const response = await axiosInstance.post(
    "/franchises",
    payload
  );
  return response.data.data;
}

export async function updateFranchise(
  id: string,
  payload: Partial<Franchise>
) {
  const response = await axiosInstance.put(
    "/franchises",
    {
      id,
      ...payload,
    }
  );
  return response.data.data;
}

export async function deleteFranchise(id: string) {
  const response = await axiosInstance.delete(
    "/franchises",
    {
      data: { id },
    }
  );
  return response.data.data;
}

export async function getFranchiseById(id: string) {
  const response = await axiosInstance.post(
    "/franchises/get-one",
    { id }
  );
  return response.data.data;
}
