import axiosInstance from "@/shared/lib/axiosInstance";
import type { AnalyticsData } from "../types/analytics.types";

export async function fetchAnalyticsOverview(): Promise<AnalyticsData> {
    const response = await axiosInstance.get("/analytics/overview");
    return response.data.data as AnalyticsData;
}
