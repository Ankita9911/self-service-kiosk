import mongoose from "mongoose";

const { Schema } = mongoose;

const categorySchema = new Schema(
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
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
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

categorySchema.index({ franchiseId: 1, outletId: 1, isDeleted: 1 });
categorySchema.index({ franchiseId: 1, outletId: 1, displayOrder: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
