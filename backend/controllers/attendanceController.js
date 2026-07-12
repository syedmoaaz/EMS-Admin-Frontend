import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";

// @route  GET /api/attendance
export const getAttendance = asyncHandler(async (req, res) => {
  const { date, status, method } = req.query;
  const query = companyQuery(req);

  if (date) query.date = date;
  if (status && status !== "all") query.status = status;
  if (method && method !== "all") query.method = method;

  const records = await Attendance.find(query).populate({
    path: "employee",
    select: "name employeeId image branch",
    populate: { path: "branch", select: "name" },
  });

  res.json({ success: true, count: records.length, data: records });
});

// @route  GET /api/attendance/stats
export const getAttendanceStats = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const query = companyQuery(req);
  if (date) query.date = date;

  const records = await Attendance.find(query);

  res.json({
    success: true,
    data: {
      present: records.filter((r) => r.status === "Present").length,
      absent: records.filter((r) => r.status === "Absent").length,
      late: records.filter((r) => r.status === "Late").length,
      working: records.filter((r) => r.status === "Working").length,
      onLeave: records.filter((r) => r.status === "On Leave").length,
    },
  });
});

// @route  GET /api/attendance/history/:employeeId
export const getAttendanceHistory = asyncHandler(async (req, res) => {
  const employee = await Employee.findOne(
    companyQuery(req, { _id: req.params.employeeId })
  );

  if (!employee) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const records = await Attendance.find(
    companyQuery(req, { employee: req.params.employeeId })
  ).sort({ date: -1 });

  res.json({ success: true, count: records.length, data: records });
});

// @route  POST /api/attendance
export const createAttendance = asyncHandler(async (req, res) => {
  const { employee, date, branch } = req.body;

  const employeeDoc = await Employee.findOne(
    companyQuery(req, { _id: employee })
  );

  if (!employeeDoc) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const record = await Attendance.findOneAndUpdate(
    { company: req.companyId, employee, date },
    {
      ...req.body,
      company: req.companyId,
      branch: branch || employeeDoc.branch,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: record });
});
