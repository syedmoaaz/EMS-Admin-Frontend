import mongoose from "mongoose";

const branchDeviceSchema = new mongoose.Schema(
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
      unique: true,
    },
    deviceSecretHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    deviceIp: { type: String, trim: true, default: "" },
    devicePort: { type: Number, default: 4370 },
    agentVersion: { type: String, trim: true, default: "" },
    lastHeartbeatAt: { type: Date, default: null },
    lastSyncAt: { type: Date, default: null },
    lastError: { type: String, default: "" },
    status: {
      type: String,
      enum: ["online", "offline", "error", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("BranchDevice", branchDeviceSchema);
