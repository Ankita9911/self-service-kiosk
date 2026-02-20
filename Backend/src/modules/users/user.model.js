import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      ref: "Franchise",
      required: false,
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
      select: false,
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
        "KIOSK_DEVICE"
      ],
      index: true,
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
    mustChangePassword: {
  type: Boolean,
  default: false,
},

  },
  { timestamps: true }
);

// Multi-tenant compound index
userSchema.index({ franchiseId: 1, outletId: 1 });

const User = mongoose.model("User", userSchema);

export default User;
