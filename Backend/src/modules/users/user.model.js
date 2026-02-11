import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: false, // Super Admin may not have franchise
      index: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      ref: "Outlet",
      required: false,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // never return by default
    },
    role: {
      type: String,
      required: true,
      enum: [
        "SUPER_ADMIN",
        "FRANCHISE_ADMIN",
        "OUTLET_MANAGER",
        "KITCHEN_STAFF",
        "PICKUP_STAFF",
      ],
      index: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for tenancy performance
userSchema.index({ franchiseId: 1, outletId: 1 });

const User = mongoose.model("User", userSchema);

export default User;
