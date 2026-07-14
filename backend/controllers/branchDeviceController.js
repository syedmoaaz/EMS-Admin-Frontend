import Branch from "../models/Branch.js";
import BranchDevice from "../models/BranchDevice.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import {
  generateDeviceSecret,
  hashDeviceSecret,
} from "../utils/deviceSecret.js";

const publicDeviceView = (device) => {
  if (!device) {
    return {
      configured: false,
      status: "pending",
      lastHeartbeatAt: null,
      lastSyncAt: null,
      lastError: "",
      deviceIp: "",
      devicePort: 4370,
      agentVersion: "",
      hasSecret: false,
    };
  }

  return {
    configured: true,
    status: device.status,
    lastHeartbeatAt: device.lastHeartbeatAt,
    lastSyncAt: device.lastSyncAt,
    lastError: device.lastError || "",
    deviceIp: device.deviceIp || "",
    devicePort: device.devicePort || 4370,
    agentVersion: device.agentVersion || "",
    hasSecret: Boolean(device.deviceSecretHash),
  };
};

// @route  GET /api/branches/:id/device
export const getBranchDevice = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne(
    companyQuery(req, { _id: req.params.id })
  );

  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  const device = await BranchDevice.findOne(
    companyQuery(req, { branch: branch._id })
  );

  res.json({
    success: true,
    data: {
      branchId: branch._id,
      branchName: branch.name,
      ...publicDeviceView(device),
    },
  });
});

// @route  POST /api/branches/:id/device-secret
export const generateBranchDeviceSecret = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne(
    companyQuery(req, { _id: req.params.id })
  );

  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  const plaintext = generateDeviceSecret();
  const deviceSecretHash = hashDeviceSecret(plaintext);

  const device = await BranchDevice.findOneAndUpdate(
    { branch: branch._id },
    {
      company: req.companyId,
      branch: branch._id,
      deviceSecretHash,
      status: "pending",
      lastError: "",
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json({
    success: true,
    message:
      "Copy this device secret now. It will not be shown again. Paste it only into this branch's agent.",
    data: {
      branchId: branch._id,
      branchName: branch.name,
      deviceSecret: plaintext,
      ...publicDeviceView(device),
    },
  });
});

// @route  DELETE /api/branches/:id/device-secret
export const revokeBranchDeviceSecret = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne(
    companyQuery(req, { _id: req.params.id })
  );

  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  const deleted = await BranchDevice.findOneAndDelete(
    companyQuery(req, { branch: branch._id })
  );

  if (!deleted) {
    res.status(404);
    throw new Error("No device secret configured for this branch");
  }

  res.json({
    success: true,
    message: "Device secret revoked. Branch agent will stop ingesting until a new secret is issued.",
  });
});
