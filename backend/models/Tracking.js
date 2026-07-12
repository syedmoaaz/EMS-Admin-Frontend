import mongoose from "mongoose";

const trackingSchema = new mongoose.Schema(
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
    },
    status: {
      type: String,
      enum: ["Moving", "Stationary", "GPS Disabled", "Offline"],
      default: "Offline",
    },
    battery: { type: String, default: "--" },
    speed: { type: String, default: "--" },
    location: { type: String, default: "--" },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
    online: { type: Boolean, default: false },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

trackingSchema.index({ company: 1, employee: 1 }, { unique: true });

export default mongoose.model("Tracking", trackingSchema);
