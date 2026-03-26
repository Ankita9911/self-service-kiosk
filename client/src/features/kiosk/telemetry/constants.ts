import { FEATURE_FLAGS } from "@/shared/constants/featureFlags";

export const TELEMETRY_SCHEMA_VERSION = 1;
export const TELEMETRY_FLUSH_INTERVAL_MS = 3000;
export const TELEMETRY_FLUSH_BATCH_SIZE = 25;
export const TELEMETRY_REQUEST_MAX_EVENTS = 50;
export const TELEMETRY_ENDPOINT = "/telemetry/kiosk/batch";
export const TELEMETRY_SESSION_STORAGE_KEY = "kiosk_telemetry_session";
export const TELEMETRY_ENABLED = FEATURE_FLAGS.KIOSK_TELEMETRY_ENABLED;
export const TELEMETRY_APP_VERSION =
  import.meta.env.VITE_APP_VERSION?.trim() || undefined;
