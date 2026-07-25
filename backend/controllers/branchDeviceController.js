import Branch from "../models/Branch.js";
import BranchDevice from "../models/BranchDevice.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import {
  assertDeviceSecretRules,
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
// Owner chooses the secret (min 14 chars). Same value is pasted into the agent.
export const setBranchDeviceSecret = asyncHandler(async (req, res) => {
  const branch = await Branch.findOne(
    companyQuery(req, { _id: req.params.id })
  );

  if (!branch) {
    res.status(404);
    throw new Error("Branch not found");
  }

  let plaintext;
  try {
    plaintext = assertDeviceSecretRules(req.body?.deviceSecret);
  } catch (err) {
    res.status(400);
    throw err;
  }

  const deviceSecretHash = hashDeviceSecret(plaintext);

  const conflict = await BranchDevice.findOne({
    deviceSecretHash,
    branch: { $ne: branch._id },
  });
  if (conflict) {
    res.status(400);
    throw new Error(
      "This secret is already used by another branch. Choose a different one."
    );
  }

  try {
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
        "Device secret saved. Paste the exact same secret into this branch's agent.",
      data: {
        branchId: branch._id,
        branchName: branch.name,
        ...publicDeviceView(device),
      },
    });
  } catch (err) {
    if (err?.code === 11000) {
      res.status(400);
      throw new Error(
        "This secret is already used by another branch. Choose a different one."
      );
    }
    throw err;
  }
});
