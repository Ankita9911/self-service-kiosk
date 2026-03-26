import test from "node:test";
import assert from "node:assert/strict";
import { getTelemetryTtlSeconds } from "../service/telemetry.cache.service.js";

test("telemetry cache uses short ttl for live overview windows", () => {
  const ttl = getTelemetryTtlSeconds("overview", {
    from: "2026-03-24T00:00:00.000Z",
    to: "2026-03-25T00:00:00.000Z",
  });

  assert.equal(ttl, 30);
});

test("telemetry cache does not cache raw session event drilldown", () => {
  const ttl = getTelemetryTtlSeconds("session_events", {
    from: "2026-03-01T00:00:00.000Z",
    to: "2026-03-25T00:00:00.000Z",
  });

  assert.equal(ttl, 0);
});

test("telemetry cache keeps session list ttl shorter than dashboard history", () => {
  const ttl = getTelemetryTtlSeconds("sessions", {
    from: "2026-03-01T00:00:00.000Z",
    to: "2026-03-25T00:00:00.000Z",
  });

  assert.equal(ttl, 30);
});
