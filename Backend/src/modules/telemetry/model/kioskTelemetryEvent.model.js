import mongoose from "mongoose";
import { TELEMETRY_RAW_TTL_SECONDS } from "../constant/telemetry.constants.js";

const { Schema } = mongoose;

const kioskTelemetryEventSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    visitorSessionId: { type: String, required: true, index: true },
    franchiseId: { type: Schema.Types.ObjectId, required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    schemaVersion: { type: Number, required: true, default: 1 },
    name: { type: String, required: true, index: true },
    seq: { type: Number, required: true },
    page: { type: String, required: true, index: true },
    component: { type: String, required: true, index: true },
    action: { type: String, required: true, index: true },
    target: { type: String, default: null },
    payload: { type: Schema.Types.Mixed, default: {} },
    appVersion: { type: String, default: null },
    eventAt: { type: Date, required: true, index: true },
    receivedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  { timestamps: false },
);

kioskTelemetryEventSchema.index({ visitorSessionId: 1, seq: 1 });
kioskTelemetryEventSchema.index({ outletId: 1, eventAt: -1 });
kioskTelemetryEventSchema.index({ deviceId: 1, eventAt: -1 });
kioskTelemetryEventSchema.index({ page: 1, component: 1, action: 1, eventAt: -1 });
kioskTelemetryEventSchema.index(
  { receivedAt: 1 },
  { expireAfterSeconds: TELEMETRY_RAW_TTL_SECONDS },
);

export default mongoose.model(
  "KioskTelemetryEvent",
  kioskTelemetryEventSchema,
);

