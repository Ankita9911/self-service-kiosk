import mongoose from "mongoose";
import { TELEMETRY_SESSION_STATUS } from "../constant/telemetry.constants.js";

const { Schema } = mongoose;

const kioskTelemetrySessionSchema = new Schema(
  {
    visitorSessionId: { type: String, required: true, unique: true, index: true },
    franchiseId: { type: Schema.Types.ObjectId, required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, required: true, index: true },
    deviceId: { type: String, required: true, index: true },
    appVersion: { type: String, default: null },
    status: {
      type: String,
      enum: Object.values(TELEMETRY_SESSION_STATUS),
      default: TELEMETRY_SESSION_STATUS.ACTIVE,
      index: true,
    },
    startedAt: { type: Date, required: true, index: true },
    lastEventAt: { type: Date, required: true, index: true },
    endedAt: { type: Date, default: null },
    entryPage: { type: String, default: null },
    exitPage: { type: String, default: null },
    pagesVisited: { type: [String], default: [] },
    funnelSteps: { type: [String], default: [] },
    eventCount: { type: Number, default: 0 },
    errorCount: { type: Number, default: 0 },
    cartCreated: { type: Boolean, default: false },
    checkoutStarted: { type: Boolean, default: false },
    orderCompleted: { type: Boolean, default: false },
    orderFailed: { type: Boolean, default: false },
    forceLoggedOut: { type: Boolean, default: false },
  },
  { timestamps: true },
);

kioskTelemetrySessionSchema.index({ outletId: 1, startedAt: -1 });
kioskTelemetrySessionSchema.index({ deviceId: 1, startedAt: -1 });
kioskTelemetrySessionSchema.index({ status: 1, startedAt: -1 });

export default mongoose.model(
  "KioskTelemetrySession",
  kioskTelemetrySessionSchema,
);

