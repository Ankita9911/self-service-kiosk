function parseBooleanFlag(value: string | undefined, defaultValue: boolean) {
  if (!value) return defaultValue;

  const normalized = value.trim().toLowerCase();
  if (["false", "0", "off", "no"].includes(normalized)) return false;
  if (["true", "1", "on", "yes"].includes(normalized)) return true;
  return defaultValue;
}

export const FEATURE_FLAGS = {
  KIOSK_TELEMETRY_ENABLED: parseBooleanFlag(
    import.meta.env.VITE_KIOSK_TELEMETRY_ENABLED,
    true,
  ),
  KIOSK_TELEMETRY_ADMIN_ENABLED: parseBooleanFlag(
    import.meta.env.VITE_ADMIN_TELEMETRY_ENABLED,
    true,
  ),
} as const;
