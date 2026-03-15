import mongoose from "mongoose";
import {
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
} from "./order.constants.js";

const { Schema } = mongoose;

const orderItemSchema = new Schema(
  {
    itemId: { type: Schema.Types.ObjectId, required: true },
    nameSnapshot: { type: String, required: true },
    priceSnapshot: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
    customizations: [
      {
        itemId: { type: Schema.Types.ObjectId, required: true },
        nameSnapshot: { type: String, required: true },
        priceSnapshot: { type: Number, required: true },
        quantity: { type: Number, required: true, min: 1 },
        lineTotal: { type: Number, required: true },
        _id: false,
      },
    ],
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    franchiseId: { type: Schema.Types.ObjectId, required: true, index: true },
    outletId:    { type: Schema.Types.ObjectId, required: true, index: true },

    orderNumber:   { type: Number, required: true },
    clientOrderId: { type: String, required: true },

    items: [orderItemSchema],

    totalAmount: { type: Number, required: true },

    paymentMethod: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.SUCCESS,
    },

    status: {
      type: String,
      enum: Object.values(ORDER_STATUS),
      default: ORDER_STATUS.CREATED,
    },

    createdByRole: { type: String, required: true },
  },
  { timestamps: true }
);

orderSchema.index({ outletId: 1, clientOrderId: 1 }, { unique: true });
orderSchema.index({ outletId: 1, orderNumber: 1 }, { unique: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
