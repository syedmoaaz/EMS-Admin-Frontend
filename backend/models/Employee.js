import mongoose from "mongoose";

export const EMPLOYEE_TYPES = ["Office Staff", "Order Taker", "Dispatcher"];
export const FIELD_EMPLOYEE_TYPES = ["Order Taker", "Dispatcher"];

const employeeSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
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
    department: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: EMPLOYEE_TYPES,
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

employeeSchema.index({ company: 1, employeeId: 1 }, { unique: true });

export default mongoose.model("Employee", employeeSchema);
