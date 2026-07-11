import Tracking from "../models/Tracking.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc   Get live tracking list
// @route  GET /api/tracking/live
export const getLiveTracking = asyncHandler(async (req, res) => {
  const records = await Tracking.find().populate({
    path: "employee",
    select: "name image designation role branch",
    populate: { path: "branch", select: "name" },
  });

  res.json({ success: true, count: records.length, data: records });
});

// @desc   Get tracking stats
// @route  GET /api/tracking/stats
export const getTrackingStats = asyncHandler(async (req, res) => {
  const records = await Tracking.find();

  res.json({
    success: true,
    data: {
      online: records.filter((r) => r.online).length,
      moving: records.filter((r) => r.status === "Moving").length,
      stationary: records.filter((r) => r.status === "Stationary").length,
      offline: records.filter(
        (r) => r.status === "Offline" || r.status === "GPS Disabled"
      ).length,
    },
  });
});

// @desc   Get one employee's tracking detail
// @route  GET /api/tracking/:employeeId
export const getEmployeeTracking = asyncHandler(async (req, res) => {
  const record = await Tracking.findOne({
    employee: req.params.employeeId,
  }).populate("employee", "name image designation role");

  if (!record) {
    res.status(404);
    throw new Error("Tracking record not found");
  }

  res.json({ success: true, data: record });
});

// @desc   Update location (from field device / mobile app)
// @route  POST /api/tracking/update
export const updateTracking = asyncHandler(async (req, res) => {
  const { employee } = req.body;

  const record = await Tracking.findOneAndUpdate(
    { employee },
    { ...req.body, lastUpdated: Date.now() },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: record });
});
