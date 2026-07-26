import Attendance from "../models/Attendance.js";
import Tracking from "../models/Tracking.js";
import FieldSession from "../models/FieldSession.js";
import Branch from "../models/Branch.js";
import Employee from "../models/Employee.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import { toDateKey } from "../services/attendanceIngestService.js";
import { formatDistanceKm } from "../utils/geoDistance.js";

const defaultRange = () => {
  const to = new Date().toISOString().slice(0, 10);
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - 6);
  const from = fromDate.toISOString().slice(0, 10);
  return { from, to };
};

// @route  GET /api/reports/attendance
export const getAttendanceReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query.from && req.query.to
    ? { from: req.query.from, to: req.query.to }
    : defaultRange();
  const { branch, status } = req.query;

  const query = companyQuery(req, {
    date: { $gte: from, $lte: to },
  });

  if (branch && branch !== "all") query.branch = branch;
  if (status && status !== "all") query.status = status;

  const records = await Attendance.find(query)
    .populate("employee", "name employeeId designation role image")
    .populate("branch", "name city")
    .sort({ date: -1 });

  const summary = {
    total: records.length,
    present: records.filter(
      (r) => r.status === "Present" || r.status === "Working"
    ).length,
    absent: records.filter((r) => r.status === "Absent").length,
    late: records.filter((r) => r.status === "Late").length,
    onLeave: records.filter((r) => r.status === "On Leave").length,
  };

  res.json({
    success: true,
    range: { from, to },
    summary,
    count: records.length,
    data: records,
  });
});

// @route  GET /api/reports/branches
export const getBranchReport = asyncHandler(async (req, res) => {
  const { from, to } = req.query.from && req.query.to
    ? { from: req.query.from, to: req.query.to }
    : defaultRange();

  const branches = await Branch.find(companyQuery(req)).lean();
  const attendance = await Attendance.find(
    companyQuery(req, { date: { $gte: from, $lte: to } })
  ).lean();

  const data = branches.map((branch) => {
    const rows = attendance.filter(
      (r) => r.branch?.toString() === branch._id.toString()
    );

    return {
      branchId: branch._id,
      name: branch.name,
      city: branch.city,
      status: branch.status,
      totalRecords: rows.length,
      present: rows.filter(
        (r) => r.status === "Present" || r.status === "Working"
      ).length,
      absent: rows.filter((r) => r.status === "Absent").length,
      late: rows.filter((r) => r.status === "Late").length,
    };
  });

  res.json({
    success: true,
    range: { from, to },
    count: data.length,
    data,
  });
});

// @route  GET /api/reports/tracking
export const getTrackingReport = asyncHandler(async (req, res) => {
  const { branch } = req.query;

  let records = await Tracking.find(companyQuery(req)).populate({
    path: "employee",
    select: "name employeeId designation role branch image",
    populate: { path: "branch", select: "name city" },
  });

  if (branch && branch !== "all") {
    records = records.filter((r) => {
      const branchId =
        typeof r.employee?.branch === "object"
          ? r.employee.branch?._id?.toString()
          : r.employee?.branch?.toString();
      return branchId === branch;
    });
  }

  const today = toDateKey(new Date());
  const empIds = records
    .map((r) => r.employee?._id || r.employee)
    .filter(Boolean);
  const sessions = empIds.length
    ? await FieldSession.find({
        company: req.companyId,
        employee: { $in: empIds },
        date: today,
      }).select("employee distanceKm")
    : [];
  const distByEmp = new Map();
  for (const s of sessions) {
    const key = String(s.employee);
    distByEmp.set(key, (distByEmp.get(key) || 0) + (Number(s.distanceKm) || 0));
  }

  const data = records.map((r) => {
    const obj = typeof r.toObject === "function" ? r.toObject() : { ...r };
    const key = String(obj.employee?._id || obj.employee || "");
    const km = distByEmp.get(key) || 0;
    obj.todayDistanceKm = km;
    obj.todayDistanceLabel = formatDistanceKm(km);
    return obj;
  });

  const summary = {
    total: data.length,
    online: data.filter((r) => r.online).length,
    moving: data.filter((r) => r.status === "Moving").length,
    stationary: data.filter((r) => r.status === "Stationary").length,
    offline: data.filter(
      (r) => r.status === "Offline" || r.status === "GPS Disabled"
    ).length,
  };

  res.json({
    success: true,
    summary,
    count: data.length,
    data,
  });
});

// @route  GET /api/reports/summary
export const getReportsSummary = asyncHandler(async (req, res) => {
  const { from, to } = req.query.from && req.query.to
    ? { from: req.query.from, to: req.query.to }
    : defaultRange();

  const filter = companyQuery(req);

  const [employees, branches, attendance, tracking] = await Promise.all([
    Employee.countDocuments(filter),
    Branch.countDocuments(filter),
    Attendance.find({ ...filter, date: { $gte: from, $lte: to } }),
    Tracking.find(filter),
  ]);

  res.json({
    success: true,
    range: { from, to },
    data: {
      totalEmployees: employees,
      totalBranches: branches,
      attendanceRecords: attendance.length,
      present: attendance.filter(
        (r) => r.status === "Present" || r.status === "Working"
      ).length,
      absent: attendance.filter((r) => r.status === "Absent").length,
      late: attendance.filter((r) => r.status === "Late").length,
      fieldOnline: tracking.filter((r) => r.online).length,
      fieldOffline: tracking.filter(
        (r) => r.status === "Offline" || r.status === "GPS Disabled"
      ).length,
    },
  });
});
