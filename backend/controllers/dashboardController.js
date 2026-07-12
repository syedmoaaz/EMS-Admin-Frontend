import Employee from "../models/Employee.js";
import Branch from "../models/Branch.js";
import Attendance from "../models/Attendance.js";
import Tracking from "../models/Tracking.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";

// @route  GET /api/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const filter = companyQuery(req);

  const [totalEmployees, totalBranches, attendance, tracking] =
    await Promise.all([
      Employee.countDocuments(filter),
      Branch.countDocuments(filter),
      Attendance.find(filter),
      Tracking.find(filter),
    ]);

  res.json({
    success: true,
    data: {
      totalEmployees,
      totalBranches,
      presentToday: attendance.filter((r) => r.status === "Present").length,
      absentToday: attendance.filter((r) => r.status === "Absent").length,
      lateToday: attendance.filter((r) => r.status === "Late").length,
      activeField: tracking.filter((r) => r.online).length,
    },
  });
});
