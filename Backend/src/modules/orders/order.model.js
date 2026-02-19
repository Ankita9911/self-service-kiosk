import mongoose from "mongoose";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    nameSnapshot: {
      type: String,
      required: true,
    },
    priceSnapshot: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    lineTotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    franchiseId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    outletId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    orderNumber: {
      type: Number,
      required: true,
    },

    clientOrderId: {
      type: String,
      required: true,
    },

    items: [orderItemSchema],

    totalAmount: {
      type: Number,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["CASH", "CARD", "UPI"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["PENDING", "SUCCESS"],
      default: "SUCCESS",
    },

    status: {
      type: String,
      enum: ["CREATED", "IN_KITCHEN", "READY", "COMPLETED"],
      default: "CREATED",
    },

    createdByRole: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Idempotency protection
orderSchema.index(
  { outletId: 1, clientOrderId: 1 },
  { unique: true }
);

// Order number per outlet uniqueness
orderSchema.index(
  { outletId: 1, orderNumber: 1 },
  { unique: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
