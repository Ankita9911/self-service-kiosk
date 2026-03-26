import { recordTelemetryBatch } from "../../../modules/telemetry/service/telemetry.aggregate.service.js";

export async function handleKioskTelemetryBatch(payload) {
  await recordTelemetryBatch(payload);
}

