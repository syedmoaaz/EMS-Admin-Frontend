import mongoose from "mongoose";

const fieldSessionSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      required: true,
    },
    date: { type: String, required: true, index: true },
    checkIn: { type: String, required: true },
    checkOut: { type: String, default: "--" },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open",
      index: true,
    },
    /** Cumulative straight-line distance in km while session is open. */
    distanceKm: { type: Number, default: 0 },
    lastLat: { type: Number, default: null },
    lastLng: { type: Number, default: null },
    pointCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

fieldSessionSchema.index({ company: 1, employee: 1, status: 1 });
fieldSessionSchema.index({ company: 1, employee: 1, date: 1 });

export default mongoose.model("FieldSession", fieldSessionSchema);
