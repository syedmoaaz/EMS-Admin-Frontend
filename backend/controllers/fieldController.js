import Employee, {
  FIELD_EMPLOYEE_TYPES,
  sanitizeEmployee,
} from "../models/Employee.js";
import Tracking from "../models/Tracking.js";
import Attendance from "../models/Attendance.js";
import Settings from "../models/Settings.js";
import asyncHandler from "../utils/asyncHandler.js";
import { generateEmployeeToken } from "../utils/generateToken.js";
import {
  getCompanyScheduleDefaults,
  resolveEmployeeSchedule,
} from "../utils/workSchedule.js";
import { normalizeEmployeeId } from "../utils/employeeIds.js";
import {
  formatClock,
  toDateKey,
} from "../services/attendanceIngestService.js";

const parseOfficeStart = (startStr = "09:00 AM") => {
  const match = String(startStr)
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hours: 9, minutes: 0 };

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
};

const weekdayName = (date) =>
  new Date(date).toLocaleDateString("en-US", { weekday: "long" });

const computeHours = (checkInStr, checkOutStr, dateKey) => {
  const parse = (clock) => {
    const m = String(clock)
      .trim()
      .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!m) return null;
    let h = Number(m[1]);
    const min = Number(m[2]);
    const ampm = m[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const d = new Date(`${dateKey}T00:00:00`);
    d.setHours(h, min, 0, 0);
    return d;
  };
  const a = parse(checkInStr);
  const b = parse(checkOutStr);
  if (!a || !b || b <= a) return "0h 0m";
  const totalMins = Math.floor((b - a) / 60000);
  return `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
};

const resolveCheckInStatus = (employee, punchedAt) => {
  return (async () => {
    const defaults = await getCompanyScheduleDefaults(employee.company);
    const schedule = resolveEmployeeSchedule(employee, defaults);
    const isWorkingDay = schedule.workingDays.includes(weekdayName(punchedAt));
    if (!isWorkingDay) return "Working";

    const { hours, minutes } = parseOfficeStart(schedule.start);
    const threshold = new Date(punchedAt);
    threshold.setHours(hours, minutes + (schedule.lateThresholdMinutes || 0), 0, 0);
    return punchedAt > threshold ? "Late" : "Working";
  })();
};

// @route  POST /api/field/login
export const fieldLogin = asyncHandler(async (req, res) => {
  const employeeId = normalizeEmployeeId(req.body.employeeId);
  const password = String(req.body.password || "");

  if (!employeeId || !password) {
    res.status(400);
    throw new Error("Employee ID and password are required");
  }

  const employee = await Employee.findOne({ employeeId })
    .select("+fieldPassword")
    .populate("branch", "name city cityCode");

  if (!employee) {
    res.status(401);
    throw new Error("Invalid Employee ID or password");
  }

  if (employee.status !== "Active") {
    res.status(401);
    throw new Error("Employee account is inactive");
  }

  if (!FIELD_EMPLOYEE_TYPES.includes(employee.role)) {
    res.status(403);
    throw new Error("Only Order Taker / Dispatcher can use the field app");
  }

  if (!employee.fieldPassword) {
    res.status(401);
    throw new Error("Field app password is not set. Ask your admin.");
  }

  const ok = await employee.compareFieldPassword(password);
  if (!ok) {
    res.status(401);
    throw new Error("Invalid Employee ID or password");
  }

  const token = generateEmployeeToken({
    employeeId: employee.employeeId,
    employeeMongoId: employee._id,
    companyId: employee.company,
    role: employee.role,
  });

  const today = toDateKey(new Date());
  const attendance = await Attendance.findOne({
    company: employee.company,
    employee: employee._id,
    date: today,
  });

  const settings = await Settings.findOne({ company: employee.company }).select(
    "gpsRules"
  );

  res.json({
    success: true,
    token,
    data: {
      ...sanitizeEmployee(employee),
      todayAttendance: attendance || null,
      gpsRefreshSeconds:
        settings?.gpsRules?.refreshIntervalSeconds ?? 30,
    },
  });
});

// @route  GET /api/field/me
export const fieldMe = asyncHandler(async (req, res) => {
  const today = toDateKey(new Date());
  const attendance = await Attendance.findOne({
    company: req.companyId,
    employee: req.employeeId,
    date: today,
  });

  const tracking = await Tracking.findOne({
    company: req.companyId,
    employee: req.employeeId,
  });

  const settings = await Settings.findOne({ company: req.companyId }).select(
    "gpsRules"
  );

  res.json({
    success: true,
    data: {
      ...sanitizeEmployee(req.employee),
      todayAttendance: attendance || null,
      tracking: tracking || null,
      gpsRefreshSeconds:
        settings?.gpsRules?.refreshIntervalSeconds ?? 30,
    },
  });
});

// @route  POST /api/field/tracking/update
export const fieldTrackingUpdate = asyncHandler(async (req, res) => {
  const employee = req.employee;
  const {
    lat,
    lng,
    battery,
    speed,
    location,
    status,
    online,
    gpsDisabled,
  } = req.body;

  let nextStatus = status;
  if (gpsDisabled === true) nextStatus = "GPS Disabled";
  if (!nextStatus) {
    if (online === false) nextStatus = "Offline";
    else if (Number(speed) > 0) nextStatus = "Moving";
    else nextStatus = "Stationary";
  }

  const record = await Tracking.findOneAndUpdate(
    { company: req.companyId, employee: employee._id },
    {
      company: req.companyId,
      employee: employee._id,
      lat: lat ?? null,
      lng: lng ?? null,
      battery: battery ?? "--",
      speed: speed != null && speed !== "" ? String(speed) : "--",
      location: location || "--",
      status: nextStatus,
      online: gpsDisabled ? false : online !== false,
      lastUpdated: Date.now(),
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: record });
});

// @route  POST /api/field/attendance/check-in
export const fieldCheckIn = asyncHandler(async (req, res) => {
  const employee = req.employee;
  const now = new Date();
  const date = toDateKey(now);
  const checkIn = formatClock(now);

  const existing = await Attendance.findOne({
    company: req.companyId,
    employee: employee._id,
    date,
  });

  if (existing && existing.checkIn && existing.checkIn !== "--") {
    res.status(400);
    throw new Error("Already checked in today");
  }

  const status = await resolveCheckInStatus(employee, now);
  const branchId =
    typeof employee.branch === "object" ? employee.branch._id : employee.branch;

  const attendance = await Attendance.findOneAndUpdate(
    { company: req.companyId, employee: employee._id, date },
    {
      company: req.companyId,
      employee: employee._id,
      branch: branchId,
      date,
      checkIn,
      checkOut: "--",
      hours: "--",
      method: "GPS",
      status,
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  // Mark online on check-in if coords provided
  if (req.body.lat != null && req.body.lng != null) {
    await Tracking.findOneAndUpdate(
      { company: req.companyId, employee: employee._id },
      {
        company: req.companyId,
        employee: employee._id,
        lat: req.body.lat,
        lng: req.body.lng,
        online: true,
        status: "Stationary",
        lastUpdated: Date.now(),
        location: req.body.location || "--",
        battery: req.body.battery || "--",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  res.status(201).json({ success: true, data: attendance });
});

// @route  POST /api/field/attendance/check-out
export const fieldCheckOut = asyncHandler(async (req, res) => {
  const employee = req.employee;
  const now = new Date();
  const date = toDateKey(now);
  const checkOut = formatClock(now);

  const existing = await Attendance.findOne({
    company: req.companyId,
    employee: employee._id,
    date,
  });

  if (!existing || !existing.checkIn || existing.checkIn === "--") {
    res.status(400);
    throw new Error("Check in first before checking out");
  }

  if (existing.checkOut && existing.checkOut !== "--") {
    res.status(400);
    throw new Error("Already checked out today");
  }

  const hours = computeHours(existing.checkIn, checkOut, date);

  existing.checkOut = checkOut;
  existing.hours = hours;
  if (existing.status === "Working") existing.status = "Present";
  existing.method = existing.method === "Biometric" ? "Biometric" : "GPS";
  await existing.save();

  await Tracking.findOneAndUpdate(
    { company: req.companyId, employee: employee._id },
    {
      online: false,
      status: "Offline",
      lastUpdated: Date.now(),
      ...(req.body.lat != null ? { lat: req.body.lat, lng: req.body.lng } : {}),
    }
  );

  res.json({ success: true, data: existing });
});
