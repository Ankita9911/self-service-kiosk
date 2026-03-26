import test from "node:test";
import assert from "node:assert/strict";
import { createTelemetryBatchSchema } from "../validation/telemetry.schemas.js";

test("telemetry batch schema accepts a minimal valid batch", () => {
  const result = createTelemetryBatchSchema.safeParse({
    visitorSessionId: "1f00c248-4b11-4c9a-8dd5-daf1f54173ae",
    appVersion: "1.2.3",
    events: [
      {
        eventId: "cf5daf18-b0b7-4a76-8277-5092f955695d",
        name: "kiosk.page_viewed",
        ts: Date.now(),
        seq: 0,
        page: "login",
        component: "page",
        action: "view",
      },
    ],
  });

  assert.equal(result.success, true);
});

test("telemetry batch schema rejects oversized event batches", () => {
  const events = Array.from({ length: 51 }, (_, index) => ({
    eventId: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    name: "kiosk.page_viewed",
    ts: Date.now(),
    seq: index,
    page: "menu",
    component: "page",
    action: "view",
  }));

  const result = createTelemetryBatchSchema.safeParse({
    visitorSessionId: "1f00c248-4b11-4c9a-8dd5-daf1f54173ae",
    events,
  });

  assert.equal(result.success, false);
});
