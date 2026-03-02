import mongoose from "mongoose";

const { Schema } = mongoose;

const franchiseSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    brandCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    contactEmail: {
      type: String,
      required:true,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },

    contactPhone: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
      index: true,
    },
    isDeleted: {
  type: Boolean,
  default: false,
  index: true,
}
  },
  {
    timestamps: true,
  }
);

franchiseSchema.index({ status: 1 });
franchiseSchema.index({ brandCode: 1 }, { unique: true });


const Franchise = mongoose.model("Franchise", franchiseSchema);

export default Franchise;
