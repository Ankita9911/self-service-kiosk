export function deriveTelemetryFreshnessStatus({
  ingestEnabled,
  latestEventAt,
  now = new Date(),
  healthyMinutes = 10,
  warningMinutes = 60,
}) {
  if (!ingestEnabled) {
    return {
      state: "disabled",
      idleMinutes: null,
      message: "Telemetry ingest is disabled",
    };
  }

  if (!latestEventAt) {
    return {
      state: "idle",
      idleMinutes: null,
      message: "No recent telemetry events found",
    };
  }

  const eventDate = latestEventAt instanceof Date
    ? latestEventAt
    : new Date(latestEventAt);
  const idleMinutes = Math.max(
    0,
    Math.round((now.getTime() - eventDate.getTime()) / 60000),
  );

  if (idleMinutes <= healthyMinutes) {
    return {
      state: "healthy",
      idleMinutes,
      message: "Telemetry flow looks current",
    };
  }

  if (idleMinutes <= warningMinutes) {
    return {
      state: "warning",
      idleMinutes,
      message: "Telemetry is flowing, but recent activity has slowed",
    };
  }

  return {
    state: "idle",
    idleMinutes,
    message: "Telemetry looks stale for the current rollout window",
  };
}
