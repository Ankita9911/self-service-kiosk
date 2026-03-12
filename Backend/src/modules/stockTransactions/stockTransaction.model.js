import mongoose, { Schema } from "mongoose";

const stockTransactionSchema = new Schema(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["PURCHASE", "CONSUMPTION", "WASTAGE", "ADJUSTMENT"],
      required: true,
    },
    // Positive = addition (PURCHASE, ADJUSTMENT+), negative = deduction (CONSUMPTION, WASTAGE, ADJUSTMENT-)
    quantity: {
      type: Number,
      required: true,
    },
    referenceType: {
      type: String,
      enum: ["ORDER", "MANUAL"],
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
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
  { timestamps: true }
);

stockTransactionSchema.index({ franchiseId: 1, outletId: 1, ingredientId: 1, createdAt: -1 });
stockTransactionSchema.index({ franchiseId: 1, outletId: 1, type: 1, createdAt: -1 });

const StockTransaction = mongoose.model("StockTransaction", stockTransactionSchema);
export default StockTransaction;
