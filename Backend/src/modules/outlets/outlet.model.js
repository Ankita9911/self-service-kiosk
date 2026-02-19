import mongoose from "mongoose";

const { Schema } = mongoose;

const outletSchema = new Schema(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    outletCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    isDeleted: {
  type: Boolean,
  default: false,
  index: true,
},
  },
  {
    timestamps: true,
  }
);


outletSchema.index(
  { franchiseId: 1, outletCode: 1 },
  { unique: true }
);

const Outlet = mongoose.model("Outlet", outletSchema);

export default Outlet;
