import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, uppercase: true },
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    manager: { type: String, trim: true },
    phone: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    openingDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Branch", branchSchema);
