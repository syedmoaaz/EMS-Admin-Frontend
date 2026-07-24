import mongoose from "mongoose";

export const EMPLOYEE_TYPES = ["Office Staff", "Order Taker", "Dispatcher"];
export const FIELD_EMPLOYEE_TYPES = ["Order Taker", "Dispatcher"];

/** Human-readable EMS ID: THT-1, KHI-12 (no leading zeros on the number) */
const EMPLOYEE_ID_RE = /^[A-Z]{2,5}-[1-9][0-9]*$/;

/** K50 device PIN: digits only, no leading zero */
const DEVICE_PIN_RE = /^[1-9][0-9]*$/;

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
      validate: {
        validator: (v) => EMPLOYEE_ID_RE.test(String(v || "")),
        message:
          "Employee ID must look like CITY-n (e.g. THT-1). No leading zeros.",
      },
    },
    /** Numeric PIN enrolled on ZKTeco K50 — digits only, no leading zero */
    devicePin: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v) => DEVICE_PIN_RE.test(String(v || "")),
        message:
          "Device PIN must be digits only with no leading zero (K50 rule).",
      },
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
    /** Display string, kept in sync with workSchedule.start/end */
    shiftTiming: { type: String, trim: true },
    /** Per-employee attendance rules (used for late / hours). Settings are defaults only. */
    workSchedule: {
      start: { type: String, trim: true, default: "09:00 AM" },
      end: { type: String, trim: true, default: "06:00 PM" },
      lateThresholdMinutes: { type: Number, default: 15, min: 0 },
      halfDayHours: { type: Number, default: 4, min: 0 },
      fullDayHours: { type: Number, default: 8, min: 1 },
      workingDays: {
        type: [String],
        default: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
      },
    },
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
employeeSchema.index({ company: 1, devicePin: 1 }, { unique: true });

export { EMPLOYEE_ID_RE, DEVICE_PIN_RE };
export default mongoose.model("Employee", employeeSchema);
