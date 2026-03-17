import axiosInstance from "@/shared/lib/axiosInstance";
import type {
  Outlet,
  OutletAddress,
} from "@/features/outlet/types/outlet.types";

export interface OutletFilterParams {
  search?: string;
  status?: "ALL" | "ACTIVE" | "INACTIVE";
  franchiseId?: string;
}

export interface CursorPageOptions {
  cursor?: string;
  limit?: number;
}

export interface PaginatedOutletsResult {
  items: Outlet[];
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

export async function getOutletsPage(
  params: OutletFilterParams = {},
  options: CursorPageOptions = {},
): Promise<PaginatedOutletsResult> {
  const query: Record<string, string> = {};
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.status && params.status !== "ALL") query.status = params.status;
  if (params.franchiseId && params.franchiseId !== "ALL")
    query.franchiseId = params.franchiseId;
  if (options.cursor) query.cursor = options.cursor;
  if (typeof options.limit === "number") query.limit = String(options.limit);

  const response = await axiosInstance.get<{
    data: Outlet[];
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
  }>("/outlets", { params: query });

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
        response.data.data.filter((o) => o.status === "ACTIVE").length,
    },
  };
}

export async function getOutlets(
  params: OutletFilterParams = {},
): Promise<Outlet[]> {
  const allOutlets: Outlet[] = [];
  let cursor: string | undefined;

  while (true) {
    const page = await getOutletsPage(params, { cursor, limit: 100 });
    allOutlets.push(...page.items);
    if (!page.pagination.hasNext || !page.pagination.nextCursor) break;
    cursor = page.pagination.nextCursor;
  }

  return allOutlets;
}

export async function createOutlet(payload: {
  franchiseId?: string;
  name: string;
  outletCode: string;
  address?: OutletAddress;
}) {
  const response = await axiosInstance.post("/outlets", payload, {
    headers: {
      "x-skip-error-toast": "true",
      "x-skip-success-toast": "true",
    },
  });
  return response.data.data;
}

export async function updateOutlet(id: string, payload: Partial<Outlet>) {
  const response = await axiosInstance.put(`/outlets/${id}`, payload, {
    headers: {
      "x-skip-error-toast": "true",
      "x-skip-success-toast": "true",
    },
  });

  return response.data.data;
}

export async function deleteOutlet(id: string) {
  const response = await axiosInstance.delete(`/outlets/${id}`);
  return response.data.data;
}

export async function setOutletStatus(
  id: string,
  status: "ACTIVE" | "INACTIVE",
): Promise<Outlet> {
  const response = await axiosInstance.patch(`/outlets/${id}/status`, {
    status,
  });
  return response.data.data;
}

export async function getOutletById(id: string) {
  const response = await axiosInstance.post("/outlets/get-one", { id });

  return response.data.data;
}
