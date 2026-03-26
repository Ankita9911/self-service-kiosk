import mongoose from "mongoose";
import {
  TELEMETRY_GRANULARITY,
  TELEMETRY_METRIC_TYPE,
} from "../constant/telemetry.constants.js";

const { Schema } = mongoose;

const kioskTelemetryRollupSchema = new Schema(
  {
    granularity: {
      type: String,
      enum: Object.values(TELEMETRY_GRANULARITY),
      required: true,
    },
    metricType: {
      type: String,
      enum: Object.values(TELEMETRY_METRIC_TYPE),
      required: true,
    },
    bucketStart: { type: Date, required: true, index: true },
    franchiseId: { type: Schema.Types.ObjectId, required: true, index: true },
    outletId: { type: Schema.Types.ObjectId, required: true, index: true },
    deviceId: { type: String, default: null, index: true },
    page: { type: String, default: null, index: true },
    component: { type: String, default: null, index: true },
    action: { type: String, default: null, index: true },
    target: { type: String, default: null },
    name: { type: String, default: null, index: true },
    outcome: { type: String, default: null, index: true },
    count: { type: Number, default: 0 },
    lastEventAt: { type: Date, default: null },
  },
  { timestamps: true },
);

kioskTelemetryRollupSchema.index(
  {
    granularity: 1,
    metricType: 1,
    bucketStart: 1,
    franchiseId: 1,
    outletId: 1,
    deviceId: 1,
    page: 1,
    component: 1,
    action: 1,
    target: 1,
    name: 1,
    outcome: 1,
  },
  { unique: true },
);

export default mongoose.model(
  "KioskTelemetryRollup",
  kioskTelemetryRollupSchema,
);

