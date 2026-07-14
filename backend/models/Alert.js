import mongoose from "mongoose";

export const ALERT_TYPES = [
  "absent",
  "late",
  "gps_disabled",
  "offline",
  "low_battery",
];

export const ALERT_SEVERITIES = ["critical", "warning", "info"];

const alertSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ALERT_TYPES,
      required: true,
    },
    severity: {
      type: String,
      enum: ALERT_SEVERITIES,
      default: "warning",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isDismissed: {
      type: Boolean,
      default: false,
    },
    sourceDate: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

alertSchema.index(
  { company: 1, type: 1, employee: 1, sourceDate: 1 },
  { unique: true }
);

export default mongoose.model("Alert", alertSchema);
