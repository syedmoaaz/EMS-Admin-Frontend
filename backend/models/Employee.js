import mongoose from "mongoose";

export const ROLES = ["Office Staff", "Order Taker", "Dispatcher"];

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    image: { type: String, default: "" },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    designation: { type: String, trim: true },
    role: {
      type: String,
      enum: ROLES,
      default: "Office Staff",
    },
    shiftTiming: { type: String, trim: true },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    joiningDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
