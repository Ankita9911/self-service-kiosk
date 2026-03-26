import AppError from "../../../shared/errors/AppError.js";
import { enqueue } from "../../../core/queue/queue.producer.js";
import {
  TELEMETRY_INGEST_ENABLED,
  TELEMETRY_QUEUE_TYPE,
  TELEMETRY_SCHEMA_VERSION,
} from "../constant/telemetry.constants.js";

export async function queueTelemetryBatch(body, context) {
  const { tenant, user } = context;

  if (!user?.deviceId || user?.type !== "DEVICE") {
    throw new AppError(
      "Device authentication required",
      403,
      "DEVICE_ONLY",
    );
  }

  if (!tenant?.franchiseId || !tenant?.outletId) {
    throw new AppError(
      "Tenant context required",
      400,
      "TENANT_CONTEXT_REQUIRED",
    );
  }

  const payload = {
    visitorSessionId: body.visitorSessionId,
    appVersion: body.appVersion || null,
    deviceId: user.deviceId,
    franchiseId: tenant.franchiseId,
    outletId: tenant.outletId,
    receivedAt: new Date().toISOString(),
    events: body.events.map((event) => ({
      eventId: event.eventId,
      schemaVersion: event.schemaVersion ?? TELEMETRY_SCHEMA_VERSION,
      name: event.name,
      ts: event.ts,
      seq: event.seq,
      page: event.page,
      component: event.component,
      action: event.action,
      target: event.target ?? null,
      payload: event.payload ?? {},
    })),
  };

  if (!TELEMETRY_INGEST_ENABLED) {
    return {
      visitorSessionId: payload.visitorSessionId,
      acceptedCount: payload.events.length,
      enqueued: false,
      skipped: true,
      reason: "TELEMETRY_INGEST_DISABLED",
    };
  }

  await enqueue(TELEMETRY_QUEUE_TYPE, payload);

  return {
    visitorSessionId: payload.visitorSessionId,
    acceptedCount: payload.events.length,
    enqueued: true,
    skipped: false,
  };
}
