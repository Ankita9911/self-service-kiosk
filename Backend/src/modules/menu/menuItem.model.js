import mongoose from "mongoose";

const { Schema } = mongoose;

const menuItemSchema = new Schema(
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
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
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
    imageUrl: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stockQuantity: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    serviceType: {
      type: String,
      enum: ["DINE_IN", "TAKE_AWAY", "BOTH"],
      default: "BOTH",
    },

    offers: [
      {
        type: {
          type: String,
          enum: ["DISCOUNT", "BOGO", "NEW", "BESTSELLER", "LIMITED"],
          required: true,
        },
        discountPercent: { type: Number, min: 0, max: 100 },
        label: { type: String, trim: true },
        _id: false,
      },
    ],

    customizationItemIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

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

menuItemSchema.index({
  franchiseId: 1,
  outletId: 1,
  categoryId: 1,
  isDeleted: 1,
});

const MenuItem = mongoose.model("MenuItem", menuItemSchema);

export default MenuItem;
