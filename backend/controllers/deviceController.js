import asyncHandler from "../utils/asyncHandler.js";
import { ingestPunches } from "../services/attendanceIngestService.js";

// @route  GET /api/device/me
export const getDeviceMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      companyId: req.companyId,
      companyName: req.company?.companyName || req.company?.name || "",
      branchId: req.branchId,
      branchName: req.branch?.name || "",
      deviceStatus: req.branchDevice?.status || "pending",
      lastSyncAt: req.branchDevice?.lastSyncAt || null,
    },
  });
});

// @route  POST /api/device/heartbeat
export const postHeartbeat = asyncHandler(async (req, res) => {
  const { deviceIp, devicePort, agentVersion, lastError } = req.body || {};
  const device = req.branchDevice;

  device.lastHeartbeatAt = new Date();
  device.status = lastError ? "error" : "online";
  if (deviceIp !== undefined) device.deviceIp = String(deviceIp);
  if (devicePort !== undefined) device.devicePort = Number(devicePort) || 4370;
  if (agentVersion !== undefined) device.agentVersion = String(agentVersion);
  if (lastError !== undefined) device.lastError = String(lastError || "");

  await device.save();

  res.json({
    success: true,
    data: {
      status: device.status,
      lastHeartbeatAt: device.lastHeartbeatAt,
      branchName: req.branch?.name,
    },
  });
});

// @route  POST /api/device/attendance/ingest
export const ingestAttendance = asyncHandler(async (req, res) => {
  const { punches, deviceSerial } = req.body || {};

  if (!Array.isArray(punches) || punches.length === 0) {
    res.status(400);
    throw new Error("punches array is required");
  }

  if (punches.length > 5000) {
    res.status(400);
    throw new Error("Too many punches in one batch (max 5000)");
  }

  const summary = await ingestPunches({
    companyId: req.companyId,
    branchId: req.branchId,
    punches,
    deviceSerial: deviceSerial || "",
  });

  const device = req.branchDevice;
  device.lastSyncAt = new Date();
  device.lastHeartbeatAt = new Date();
  device.status = summary.errors.length ? "error" : "online";
  device.lastError = summary.errors.length
    ? `${summary.errors.length} punch error(s)`
    : "";
  await device.save();

  res.json({
    success: true,
    data: summary,
  });
});
