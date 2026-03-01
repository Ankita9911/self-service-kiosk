import mongoose from "mongoose";

const { Schema } = mongoose;

const comboItemSchema = new Schema(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: "MenuItem", required: true },
    name: { type: String, required: true, trim: true }, // denormalized
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const comboSchema = new Schema(
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
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    imageUrl: { type: String, trim: true },
    items: [comboItemSchema],
    originalPrice: { type: Number, default: 0, min: 0 },
    comboPrice: { type: Number, required: true, min: 0 },
    serviceType: {
      type: String,
      enum: ["DINE_IN", "TAKE_AWAY", "BOTH"],
      default: "BOTH",
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

const Combo = mongoose.model("Combo", comboSchema);
export default Combo;
