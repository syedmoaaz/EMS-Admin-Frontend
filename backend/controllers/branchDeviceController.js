import Branch from "../models/Branch.js";
import BranchDevice from "../models/BranchDevice.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import { assertDeviceSecretRules } from "../utils/deviceSecret.js";

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
      deviceSecret: "",
    };
  }

  const plain = device.deviceSecret || "";

  return {
    configured: true,
    status: device.status,
    lastHeartbeatAt: device.lastHeartbeatAt,
    lastSyncAt: device.lastSyncAt,
    lastError: device.lastError || "",
    deviceIp: device.deviceIp || "",
    devicePort: device.devicePort || 4370,
    agentVersion: device.agentVersion || "",
    hasSecret: Boolean(plain),
    deviceSecret: plain,
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

  const conflict = await BranchDevice.findOne({
    deviceSecret: plaintext,
    branch: { $ne: branch._id },
  });
  if (conflict) {
    res.status(400);
    throw new Error(
      "This secret is already used by another branch. Choose a different one."
    );
  }

  const existing = await BranchDevice.findOne({ branch: branch._id });
  const isUpdate = Boolean(existing?.deviceSecret);

  try {
    const device = await BranchDevice.findOneAndUpdate(
      { branch: branch._id },
      {
        company: req.companyId,
        branch: branch._id,
        deviceSecret: plaintext,
        $unset: { deviceSecretHash: 1 },
        status: existing?.status === "online" ? "online" : "pending",
        lastError: "",
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: isUpdate
        ? "Agent secret updated successfully"
        : "Agent secret created successfully",
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
