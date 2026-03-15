import mongoose from "mongoose";
import { DEVICE_STATUS } from "./device.constants.js";

const { Schema } = mongoose;

const deviceSchema = new Schema(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
      index: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: true,
      index: true,
    },

    deviceId: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    deviceSecretHash: { type: String, required: true, select: false },

    name: { type: String, trim: true },

    status: {
      type: String,
      enum: Object.values(DEVICE_STATUS),
      default: DEVICE_STATUS.ACTIVE,
      index: true,
    },

    lastSeenAt: Date,
    appVersion: String,
    osVersion: String,
    ipAddress: String,

    landingImage: { type: String },
    landingTitle: { type: String },
    landingSubtitle: { type: String },

    isDeleted: { type: Boolean, default: false, index: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

deviceSchema.index({ franchiseId: 1, outletId: 1 });

export default mongoose.model("Device", deviceSchema);
