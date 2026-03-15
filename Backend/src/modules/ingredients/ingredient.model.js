import mongoose, { Schema } from "mongoose";
import { INGREDIENT_UNIT } from "./ingredient.constants.js";

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    unit: {
      type: String,
      enum: Object.values(INGREDIENT_UNIT),
      required: true,
    },

    currentStock: { type: Number, default: 0, min: 0 },
    minThreshold: { type: Number, default: 0, min: 0 },

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

    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

ingredientSchema.index({ franchiseId: 1, outletId: 1, isDeleted: 1 });
ingredientSchema.index({ franchiseId: 1, outletId: 1, name: 1, isDeleted: 1 });

const Ingredient = mongoose.model("Ingredient", ingredientSchema);

export default Ingredient;
