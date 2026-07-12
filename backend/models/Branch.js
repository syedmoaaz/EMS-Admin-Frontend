import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
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

branchSchema.index({ company: 1, code: 1 }, { unique: true, sparse: true });

export default mongoose.model("Branch", branchSchema);
