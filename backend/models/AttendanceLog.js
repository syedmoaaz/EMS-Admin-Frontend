import mongoose from "mongoose";

const attendanceLogSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    employeeId: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    punchedAt: { type: Date, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    source: {
      type: String,
      enum: ["biometric"],
      default: "biometric",
    },
    deviceSerial: { type: String, trim: true, default: "" },
    unmatched: { type: Boolean, default: false },
    raw: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

attendanceLogSchema.index(
  { company: 1, branch: 1, employeeId: 1, punchedAt: 1 },
  { unique: true }
);
attendanceLogSchema.index({ company: 1, branch: 1, date: 1 });

export default mongoose.model("AttendanceLog", attendanceLogSchema);
