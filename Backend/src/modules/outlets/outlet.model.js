import mongoose from "mongoose";
import { OUTLET_STATUS } from "./outlet.constants.js";

const { Schema } = mongoose;

const outletSchema = new Schema(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },
    outletCode: { type: String, required: true, uppercase: true, trim: true },

    address: {
      line1: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      country: { type: String, trim: true },
    },

    status: {
      type: String,
      enum: Object.values(OUTLET_STATUS),
      default: OUTLET_STATUS.ACTIVE,
      index: true,
    },

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

outletSchema.index({ franchiseId: 1, outletCode: 1 }, { unique: true });

const Outlet = mongoose.model("Outlet", outletSchema);

export default Outlet;
