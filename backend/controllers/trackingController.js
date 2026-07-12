import Tracking from "../models/Tracking.js";
import Employee from "../models/Employee.js";
import { FIELD_EMPLOYEE_TYPES } from "../models/Employee.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";

// @route  GET /api/tracking/live
export const getLiveTracking = asyncHandler(async (req, res) => {
  const records = await Tracking.find(companyQuery(req)).populate({
    path: "employee",
    select: "name image designation role branch department",
    populate: { path: "branch", select: "name" },
  });

  res.json({ success: true, count: records.length, data: records });
});

// @route  GET /api/tracking/stats
export const getTrackingStats = asyncHandler(async (req, res) => {
  const records = await Tracking.find(companyQuery(req));

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

// @route  GET /api/tracking/:employeeId
export const getEmployeeTracking = asyncHandler(async (req, res) => {
  const record = await Tracking.findOne(
    companyQuery(req, { employee: req.params.employeeId })
  ).populate("employee", "name image designation role department");

  if (!record) {
    res.status(404);
    throw new Error("Tracking record not found");
  }

  res.json({ success: true, data: record });
});

// @route  POST /api/tracking/update
export const updateTracking = asyncHandler(async (req, res) => {
  const { employee, company: bodyCompany } = req.body;

  const employeeDoc = await Employee.findOne({ _id: employee });

  if (!employeeDoc) {
    res.status(404);
    throw new Error("Employee not found");
  }

  if (!FIELD_EMPLOYEE_TYPES.includes(employeeDoc.role)) {
    res.status(400);
    throw new Error("Only field employees can have GPS tracking data");
  }

  const companyId = req.companyId || bodyCompany || employeeDoc.company;

  if (req.companyId && employeeDoc.company.toString() !== req.companyId.toString()) {
    res.status(403);
    throw new Error("Employee does not belong to your company");
  }

  const record = await Tracking.findOneAndUpdate(
    { company: companyId, employee },
    { ...req.body, company: companyId, lastUpdated: Date.now() },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: record });
});
