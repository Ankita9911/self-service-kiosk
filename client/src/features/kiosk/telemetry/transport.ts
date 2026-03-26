import { getKioskToken } from "@/shared/lib/kioskSession";
import { TELEMETRY_APP_VERSION, TELEMETRY_ENDPOINT } from "./constants";
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

export function withAppVersion(
  batch: TelemetryBatchRequest,
): TelemetryBatchRequest {
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
  if (!token) {
    console.error("[TELEMETRY] No token from getKioskToken()");
    return "unauthenticated";
  }

  // DEBUG: Log token payload
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("[TELEMETRY] Sending token with payload:", {
      type: payload.type,
      role: payload.role,
      deviceId: payload.deviceId,
    });
  } catch (e) {
    console.error("[TELEMETRY] Could not decode token:", e);
  }

  try {
    // `sendBeacon` cannot attach the bearer token this API requires, so unload
    // flushes use `fetch(..., { keepalive: true })` instead.
    const url = buildTelemetryBatchUrl();
    console.log("[TELEMETRY] Posting to:", url);

    const response = await fetch(url, {
      method: "POST",
      keepalive: options.keepalive === true,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(withAppVersion(batch)),
    });

    console.log("[TELEMETRY] Response status:", response.status);

    if (response.ok) {
      console.log("[TELEMETRY] ✅ Batch sent successfully");
      return "sent";
    }

    if (response.status === 401 || response.status === 403) {
      const text = await response.text();
      console.error("[TELEMETRY] ❌ Auth error (403/401):", text);
      return "unauthenticated";
    }

    console.error(
      "[TELEMETRY] ❌ Request failed with status:",
      response.status,
    );
    return "failed";
  } catch (err) {
    console.error("[TELEMETRY] ❌ Network error:", err);
    return "failed";
  }
}
