import { getKioskToken } from "@/shared/lib/kioskSession";
import {
  TELEMETRY_APP_VERSION,
  TELEMETRY_ENDPOINT,
} from "./constants";
import type {
  TelemetryBatchRequest,
  TelemetryFlushOptions,
  TelemetryTransportStatus,
} from "./types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

export function buildTelemetryBatchUrl() {
  return `${API_BASE_URL}${TELEMETRY_ENDPOINT}`;
}

export function withAppVersion(batch: TelemetryBatchRequest): TelemetryBatchRequest {
  if (!TELEMETRY_APP_VERSION || batch.appVersion) {
    return batch;
  }

  return {
    ...batch,
    appVersion: TELEMETRY_APP_VERSION,
  };
}

export async function postTelemetryBatch(
  batch: TelemetryBatchRequest,
  options: TelemetryFlushOptions = {},
): Promise<TelemetryTransportStatus> {
  const token = getKioskToken();
  if (!token) return "unauthenticated";

  try {
    // `sendBeacon` cannot attach the bearer token this API requires, so unload
    // flushes use `fetch(..., { keepalive: true })` instead.
    const response = await fetch(buildTelemetryBatchUrl(), {
      method: "POST",
      keepalive: options.keepalive === true,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(withAppVersion(batch)),
    });

    if (response.ok) return "sent";
    if (response.status === 401 || response.status === 403) {
      return "unauthenticated";
    }

    return "failed";
  } catch {
    return "failed";
  }
}
