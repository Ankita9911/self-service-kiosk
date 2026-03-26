function parseBooleanEnv(value, defaultValue = true) {
  if (value == null) return defaultValue;

  const normalized = String(value).trim().toLowerCase();
  if (["false", "0", "off", "no"].includes(normalized)) return false;
  if (["true", "1", "on", "yes"].includes(normalized)) return true;
  return defaultValue;
}

export const TELEMETRY_QUEUE_TYPE = "KIOSK_TELEMETRY_BATCH";
export const TELEMETRY_SCHEMA_VERSION = 1;
export const TELEMETRY_MAX_BATCH_SIZE = 50;
export const TELEMETRY_RAW_TTL_SECONDS = 60 * 24 * 60 * 60;
export const TELEMETRY_INGEST_ENABLED = parseBooleanEnv(
  process.env.TELEMETRY_INGEST_ENABLED,
  true,
);
export const TELEMETRY_READ_CACHE_ENABLED = parseBooleanEnv(
  process.env.TELEMETRY_READ_CACHE_ENABLED,
  true,
);

export const TELEMETRY_SESSION_STATUS = {
  ACTIVE: "ACTIVE",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  FORCED_LOGOUT: "FORCED_LOGOUT",
};

export const TELEMETRY_GRANULARITY = {
  MINUTE: "minute",
  HOUR: "hour",
  DAY: "day",
};

export const TELEMETRY_METRIC_TYPE = {
  PAGE: "page",
  COMPONENT: "component",
  DEVICE: "device",
  FUNNEL: "funnel",
  ERROR: "error",
};
