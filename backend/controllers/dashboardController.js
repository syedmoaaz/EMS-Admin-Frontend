import Employee from "../models/Employee.js";
import Branch from "../models/Branch.js";
import Attendance from "../models/Attendance.js";
import Tracking from "../models/Tracking.js";
import Alert from "../models/Alert.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import { syncCompanyAlerts } from "./alertController.js";

// @route  GET /api/dashboard/stats
export const getDashboardStats = asyncHandler(async (req, res) => {
  const filter = companyQuery(req);
  const today = new Date().toISOString().slice(0, 10);

  await syncCompanyAlerts(req.companyId);

  const [totalEmployees, totalBranches, attendance, tracking, activeAlerts] =
    await Promise.all([
      Employee.countDocuments(filter),
      Branch.countDocuments(filter),
      Attendance.find({ ...filter, date: today }),
      Tracking.find(filter),
      Alert.countDocuments({
        ...filter,
        isDismissed: false,
        isRead: false,
      }),
    ]);

  res.json({
    success: true,
    data: {
      totalEmployees,
      totalBranches,
      presentToday: attendance.filter(
        (r) => r.status === "Present" || r.status === "Working"
      ).length,
      absentToday: attendance.filter((r) => r.status === "Absent").length,
      lateToday: attendance.filter((r) => r.status === "Late").length,
      onLeaveToday: attendance.filter((r) => r.status === "On Leave").length,
      activeField: tracking.filter((r) => r.online).length,
      activeAlerts,
    },
  });
});
