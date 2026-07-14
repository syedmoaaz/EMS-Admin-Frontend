import Alert from "../models/Alert.js";
import Attendance from "../models/Attendance.js";
import Tracking from "../models/Tracking.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";

const batteryPercent = (value) => {
  if (!value || value === "--") return null;
  const num = parseInt(String(value).replace("%", ""), 10);
  return Number.isNaN(num) ? null : num;
};

const upsertAlert = async ({
  companyId,
  type,
  severity,
  title,
  message,
  employeeId,
  branchId,
  sourceDate,
}) => {
  const filter = {
    company: companyId,
    type,
    employee: employeeId,
    sourceDate,
  };

  const existing = await Alert.findOne(filter);

  if (existing?.isDismissed) {
    return existing;
  }

  if (existing) {
    existing.severity = severity;
    existing.title = title;
    existing.message = message;
    existing.branch = branchId || null;
    await existing.save();
    return existing;
  }

  return Alert.create({
    ...filter,
    severity,
    title,
    message,
    branch: branchId || null,
    isRead: false,
    isDismissed: false,
  });
};

export const syncCompanyAlerts = async (companyId) => {
  const today = new Date().toISOString().slice(0, 10);
  const filter = { company: companyId };

  const [attendance, tracking] = await Promise.all([
    Attendance.find({ ...filter, date: today }).populate(
      "employee",
      "name employeeId branch"
    ),
    Tracking.find(filter).populate("employee", "name employeeId branch"),
  ]);

  for (const record of attendance) {
    const emp = record.employee;
    if (!emp) continue;

    const branchId = record.branch || emp.branch;

    if (record.status === "Absent") {
      await upsertAlert({
        companyId,
        type: "absent",
        severity: "critical",
        title: "Employee Absent",
        message: `${emp.name} is marked absent today.`,
        employeeId: emp._id,
        branchId,
        sourceDate: today,
      });
    }

    if (record.status === "Late") {
      await upsertAlert({
        companyId,
        type: "late",
        severity: "warning",
        title: "Late Arrival",
        message: `${emp.name} checked in late (${record.checkIn || "time n/a"}).`,
        employeeId: emp._id,
        branchId,
        sourceDate: today,
      });
    }
  }

  for (const track of tracking) {
    const emp = track.employee;
    if (!emp) continue;

    const branchId = emp.branch;

    if (track.status === "GPS Disabled") {
      await upsertAlert({
        companyId,
        type: "gps_disabled",
        severity: "critical",
        title: "GPS Disabled",
        message: `${emp.name} has GPS disabled.`,
        employeeId: emp._id,
        branchId,
        sourceDate: today,
      });
    }

    if (track.status === "Offline" || track.online === false) {
      if (track.status !== "GPS Disabled") {
        await upsertAlert({
          companyId,
          type: "offline",
          severity: "warning",
          title: "Employee Offline",
          message: `${emp.name} is currently offline.`,
          employeeId: emp._id,
          branchId,
          sourceDate: today,
        });
      }
    }

    const battery = batteryPercent(track.battery);
    if (battery !== null && battery <= 35) {
      await upsertAlert({
        companyId,
        type: "low_battery",
        severity: "info",
        title: "Low Battery",
        message: `${emp.name}'s device battery is at ${track.battery}.`,
        employeeId: emp._id,
        branchId,
        sourceDate: today,
      });
    }
  }
};

// @route  GET /api/alerts
export const getAlerts = asyncHandler(async (req, res) => {
  const { type, severity, branch, isRead, includeDismissed } = req.query;

  if (req.query.sync === "true") {
    await syncCompanyAlerts(req.companyId);
  }

  const query = companyQuery(req);

  if (includeDismissed !== "true") {
    query.isDismissed = false;
  }

  if (type && type !== "all") query.type = type;
  if (severity && severity !== "all") query.severity = severity;
  if (branch && branch !== "all") query.branch = branch;
  if (isRead === "true") query.isRead = true;
  if (isRead === "false") query.isRead = false;

  const alerts = await Alert.find(query)
    .populate("employee", "name employeeId image designation role")
    .populate("branch", "name city")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: alerts.length, data: alerts });
});

// @route  GET /api/alerts/unread-count
export const getUnreadCount = asyncHandler(async (req, res) => {
  if (req.query.sync === "true") {
    await syncCompanyAlerts(req.companyId);
  }

  const count = await Alert.countDocuments(
    companyQuery(req, { isRead: false, isDismissed: false })
  );

  res.json({ success: true, data: { count } });
});

// @route  POST /api/alerts/sync
export const syncAlerts = asyncHandler(async (req, res) => {
  await syncCompanyAlerts(req.companyId);

  const alerts = await Alert.find(
    companyQuery(req, { isDismissed: false })
  )
    .populate("employee", "name employeeId image designation role")
    .populate("branch", "name city")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: alerts.length, data: alerts });
});

// @route  PATCH /api/alerts/:id/read
export const markAlertRead = asyncHandler(async (req, res) => {
  const alert = await Alert.findOneAndUpdate(
    companyQuery(req, { _id: req.params.id }),
    { isRead: true },
    { new: true }
  );

  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }

  res.json({ success: true, data: alert });
});

// @route  PATCH /api/alerts/read-all
export const markAllRead = asyncHandler(async (req, res) => {
  await Alert.updateMany(
    companyQuery(req, { isRead: false, isDismissed: false }),
    { isRead: true }
  );

  res.json({ success: true, message: "All alerts marked as read" });
});

// @route  PATCH /api/alerts/:id/dismiss
export const dismissAlert = asyncHandler(async (req, res) => {
  const alert = await Alert.findOneAndUpdate(
    companyQuery(req, { _id: req.params.id }),
    { isDismissed: true, isRead: true },
    { new: true }
  );

  if (!alert) {
    res.status(404);
    throw new Error("Alert not found");
  }

  res.json({ success: true, data: alert });
});
