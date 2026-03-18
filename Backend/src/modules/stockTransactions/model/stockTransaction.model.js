import mongoose, { Schema } from "mongoose";
import {
  TRANSACTION_TYPE,
  REFERENCE_TYPE,
  SOURCE_TYPE,
} from "../constant/stockTransaction.constants.js";

const stockTransactionSchema = new Schema(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: false,
      index: true,
    },

    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: false,
      index: true,
    },

    sourceType: {
      type: String,
      enum: Object.values(SOURCE_TYPE),
      required: true,
      default: SOURCE_TYPE.INGREDIENT,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(TRANSACTION_TYPE),
      required: true,
    },

    // Positive = addition (PURCHASE, ADJUSTMENT+), negative = deduction (CONSUMPTION, WASTAGE, ADJUSTMENT-)
    quantity: { type: Number, required: true },

    referenceType: {
      type: String,
      enum: Object.values(REFERENCE_TYPE),
      required: true,
    },

    referenceId: { type: Schema.Types.ObjectId, default: null },

    note: { type: String, trim: true, default: "" },

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
  },
  { timestamps: true },
);

stockTransactionSchema.index({
  franchiseId: 1,
  outletId: 1,
  ingredientId: 1,
  createdAt: -1,
});
stockTransactionSchema.index({
  franchiseId: 1,
  outletId: 1,
  menuItemId: 1,
  createdAt: -1,
});
stockTransactionSchema.index({
  franchiseId: 1,
  outletId: 1,
  sourceType: 1,
  type: 1,
  createdAt: -1,
});

const StockTransaction = mongoose.model(
  "StockTransaction",
  stockTransactionSchema,
);

export default StockTransaction;
