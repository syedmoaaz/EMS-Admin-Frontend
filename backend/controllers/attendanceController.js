import Attendance from "../models/Attendance.js";
import asyncHandler from "../utils/asyncHandler.js";

// @desc   Get attendance list (filters: date, branch, status, method, search)
// @route  GET /api/attendance
export const getAttendance = asyncHandler(async (req, res) => {
  const { date, status, method } = req.query;

  const query = {};
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

// @desc   Get attendance stats
// @route  GET /api/attendance/stats
export const getAttendanceStats = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const match = date ? { date } : {};

  const records = await Attendance.find(match);

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

// @desc   Get attendance history for one employee
// @route  GET /api/attendance/history/:employeeId
export const getAttendanceHistory = asyncHandler(async (req, res) => {
  const records = await Attendance.find({
    employee: req.params.employeeId,
  }).sort({ date: -1 });

  res.json({ success: true, count: records.length, data: records });
});

// @desc   Create / upsert attendance record
// @route  POST /api/attendance
export const createAttendance = asyncHandler(async (req, res) => {
  const { employee, date } = req.body;

  const record = await Attendance.findOneAndUpdate(
    { employee, date },
    req.body,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(201).json({ success: true, data: record });
});
