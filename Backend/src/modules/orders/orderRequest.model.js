import mongoose from "mongoose";
import { ORDER_REQUEST_STATUS } from "./order.constants.js";

const { Schema } = mongoose;

const orderRequestSchema = new Schema(
  {
    franchiseId: { type: Schema.Types.ObjectId, required: true, index: true },
    outletId:    { type: Schema.Types.ObjectId, required: true, index: true },
    clientOrderId: { type: String, required: true },
    orderNumber:   { type: Number, required: true },
    status: {
      type: String,
      enum: Object.values(ORDER_REQUEST_STATUS),
      default: ORDER_REQUEST_STATUS.PENDING,
      index: true,
    },
    errorMessage: { type: String, default: null },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
  },
  { timestamps: true }
);

orderRequestSchema.index({ outletId: 1, clientOrderId: 1 }, { unique: true });

const OrderRequest = mongoose.model("OrderRequest", orderRequestSchema);

export default OrderRequest;
