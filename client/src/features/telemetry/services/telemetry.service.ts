import axiosInstance from "@/shared/lib/axiosInstance";
import type {
  KioskTelemetryComponents,
  KioskTelemetryDevices,
  KioskTelemetryErrors,
  KioskTelemetryFilters,
  KioskTelemetryFunnel,
  KioskTelemetryOverview,
  KioskTelemetryPages,
  KioskTelemetryStatus,
  KioskTelemetrySessionDetail,
  KioskTelemetrySessionEvents,
  KioskTelemetrySessions,
} from "../types/telemetry.types";

type SessionListParams = KioskTelemetryFilters & {
  cursor?: string | null;
  limit?: number;
};

function buildParams(filters: object) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(
    filters as Record<string, string | number | null | undefined>,
  )) {
    if (value === null || value === undefined) continue;

    const normalized =
      typeof value === "string" ? value.trim() : String(value);
    if (!normalized) continue;

    params.set(key, normalized);
  }

  return Object.fromEntries(params.entries());
}

export async function fetchKioskTelemetryOverview(
  filters: KioskTelemetryFilters,
): Promise<KioskTelemetryOverview> {
  const response = await axiosInstance.get("/telemetry/kiosk/overview", {
    params: buildParams(filters),
  });
  return response.data.data as KioskTelemetryOverview;
}

export async function fetchKioskTelemetryStatus(
  filters: KioskTelemetryFilters,
): Promise<KioskTelemetryStatus> {
  const response = await axiosInstance.get("/telemetry/kiosk/status", {
    params: buildParams(filters),
  });
  return response.data.data as KioskTelemetryStatus;
}

export async function fetchKioskTelemetryFunnel(
  filters: KioskTelemetryFilters,
): Promise<KioskTelemetryFunnel> {
  const response = await axiosInstance.get("/telemetry/kiosk/funnel", {
    params: buildParams(filters),
  });
  return response.data.data as KioskTelemetryFunnel;
}

export async function fetchKioskTelemetryPages(
  filters: KioskTelemetryFilters,
): Promise<KioskTelemetryPages> {
  const response = await axiosInstance.get("/telemetry/kiosk/pages", {
    params: buildParams(filters),
  });
  return response.data.data as KioskTelemetryPages;
}

export async function fetchKioskTelemetryComponents(
  filters: KioskTelemetryFilters,
): Promise<KioskTelemetryComponents> {
  const response = await axiosInstance.get("/telemetry/kiosk/components", {
    params: buildParams(filters),
  });
  return response.data.data as KioskTelemetryComponents;
}

export async function fetchKioskTelemetryDevices(
  filters: KioskTelemetryFilters,
): Promise<KioskTelemetryDevices> {
  const response = await axiosInstance.get("/telemetry/kiosk/devices", {
    params: buildParams(filters),
  });
  return response.data.data as KioskTelemetryDevices;
}

export async function fetchKioskTelemetryErrors(
  filters: KioskTelemetryFilters,
): Promise<KioskTelemetryErrors> {
  const response = await axiosInstance.get("/telemetry/kiosk/errors", {
    params: buildParams(filters),
  });
  return response.data.data as KioskTelemetryErrors;
}

export async function fetchKioskTelemetrySessions(
  filters: SessionListParams,
): Promise<KioskTelemetrySessions> {
  const response = await axiosInstance.get("/telemetry/kiosk/sessions", {
    params: buildParams(filters),
  });

  return {
    window: response.data.meta.window,
    items: response.data.data,
    pagination: response.data.meta.pagination,
  } as KioskTelemetrySessions;
}

export async function fetchKioskTelemetrySessionDetail(
  visitorSessionId: string,
): Promise<KioskTelemetrySessionDetail> {
  const response = await axiosInstance.get(
    `/telemetry/kiosk/sessions/${visitorSessionId}`,
  );
  return response.data.data as KioskTelemetrySessionDetail;
}

export async function fetchKioskTelemetrySessionEvents(
  visitorSessionId: string,
): Promise<KioskTelemetrySessionEvents> {
  const response = await axiosInstance.get(
    `/telemetry/kiosk/sessions/${visitorSessionId}/events`,
  );
  return response.data.data as KioskTelemetrySessionEvents;
}
