import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: { type: String, required: true },
    checkIn: { type: String, default: "--" },
    checkOut: { type: String, default: "--" },
    hours: { type: String, default: "--" },
    method: {
      type: String,
      enum: ["Biometric", "GPS", "Manual", "--"],
      default: "--",
    },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Working", "On Leave"],
      required: true,
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
