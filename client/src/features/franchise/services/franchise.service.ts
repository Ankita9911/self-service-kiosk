import axiosInstance from "@/shared/lib/axiosInstance";
import type { Franchise } from "@/features/franchise/types/franchise.types";

export interface FranchiseFilterParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
}

export interface CursorPageOptions {
  cursor?: string;
  limit?: number;
}

interface RequestBehaviorOptions {
  suppressErrorToast?: boolean;
}

export interface PaginatedFranchisesResult {
  items: Franchise[];
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

export interface CreateFranchiseDTO {
  name: string;
  brandCode: string;
  contactEmail?: string;
  contactPhone?: string;
}

export async function getFranchisesPage(
  params: FranchiseFilterParams = {},
  options: CursorPageOptions = {},
  requestOptions: RequestBehaviorOptions = {},
): Promise<PaginatedFranchisesResult> {
  const query: Record<string, string> = {};
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "ALL") query.status = params.status;
  if (options.cursor) query.cursor = options.cursor;
  if (typeof options.limit === "number") query.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: Franchise[];
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
  }>("/franchises", {
    params: query,
    ...(requestOptions.suppressErrorToast
      ? { headers: { "x-skip-error-toast": "true" } }
      : {}),
  });

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
      activeItems:
        stats.activeItems ??
        response.data.data.filter((f) => f.status === "ACTIVE").length,
    },
  };
}

export async function getFranchises(
  params: FranchiseFilterParams = {},
  requestOptions: RequestBehaviorOptions = {},
): Promise<Franchise[]> {
  const allFranchises: Franchise[] = [];
  let cursor: string | undefined;

  while (true) {
    const page = await getFranchisesPage(
      params,
      { cursor, limit: 100 },
      requestOptions,
    );
    allFranchises.push(...page.items);
    if (!page.pagination.hasNext || !page.pagination.nextCursor) break;
    cursor = page.pagination.nextCursor;
  }

  return allFranchises;
}

export async function getFranchiseById(id: string): Promise<Franchise> {
  const response = await axiosInstance.post("/franchises/get-one", { id });
  return response.data.data;
}

export async function createFranchise(
  payload: CreateFranchiseDTO,
): Promise<Franchise> {
  const response = await axiosInstance.post("/franchises", payload);
  return response.data.data;
}

export async function updateFranchise(
  id: string,
  payload: Partial<Franchise>,
): Promise<Franchise> {
  const response = await axiosInstance.put(`/franchises/${id}`, payload);

  return response.data.data;
}
export async function deleteFranchise(id: string): Promise<void> {
  await axiosInstance.delete(`/franchises/${id}`);
}

export async function setFranchiseStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<Franchise> {
  const response = await axiosInstance.patch(`/franchises/${id}/status`, {
    status,
  });
  return response.data.data;
}
