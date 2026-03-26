import test from "node:test";
import assert from "node:assert/strict";
import { deriveTelemetryFreshnessStatus } from "../utils/telemetry.status.utils.js";

test("freshness status returns disabled when ingest is off", () => {
  const status = deriveTelemetryFreshnessStatus({
    ingestEnabled: false,
    latestEventAt: null,
  });

  assert.equal(status.state, "disabled");
  assert.equal(status.idleMinutes, null);
});

test("freshness status returns healthy for recent events", () => {
  const now = new Date("2026-03-25T12:00:00.000Z");
  const status = deriveTelemetryFreshnessStatus({
    ingestEnabled: true,
    latestEventAt: "2026-03-25T11:56:00.000Z",
    now,
  });

  assert.equal(status.state, "healthy");
  assert.equal(status.idleMinutes, 4);
});

test("freshness status returns idle for stale streams", () => {
  const now = new Date("2026-03-25T12:00:00.000Z");
  const status = deriveTelemetryFreshnessStatus({
    ingestEnabled: true,
    latestEventAt: "2026-03-25T09:00:00.000Z",
    now,
  });

  assert.equal(status.state, "idle");
  assert.equal(status.idleMinutes, 180);
});
