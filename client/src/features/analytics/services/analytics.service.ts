import axiosInstance from "@/shared/lib/axiosInstance";
import type { AnalyticsData } from "../types/analytics.types";

export async function fetchAnalyticsOverview(period?: string): Promise<AnalyticsData> {
  const response = await axiosInstance.get("/analytics/overview", {
    params: period ? { period } : {},
  });
  return response.data.data as AnalyticsData;
}
