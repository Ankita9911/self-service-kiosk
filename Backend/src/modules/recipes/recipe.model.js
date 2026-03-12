import mongoose, { Schema } from "mongoose";

const recipeIngredientSchema = new Schema(
  {
    ingredientId: {
      type: Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const recipeSchema = new Schema(
  {
    menuItemId: {
      type: Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    ingredients: [recipeIngredientSchema],
    prepTime: {
      type: Number,
      min: 0,
      default: 0,
    },
    instructions: {
      type: String,
      trim: true,
      default: "",
    },
    aiGenerated: {
      type: Boolean,
      default: false,
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
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// One active recipe per menu item per outlet
recipeSchema.index(
  { franchiseId: 1, outletId: 1, menuItemId: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
