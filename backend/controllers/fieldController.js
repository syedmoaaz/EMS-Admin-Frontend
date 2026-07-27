import Employee, {
  FIELD_EMPLOYEE_TYPES,
  sanitizeEmployee,
} from "../models/Employee.js";
import Tracking from "../models/Tracking.js";
import Attendance from "../models/Attendance.js";
import FieldSession from "../models/FieldSession.js";
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
import {
  companyWallTimeOnDay,
  weekdayNameInCompanyTz,
} from "../utils/companyTime.js";
import { formatDistanceKm, segmentKm } from "../utils/geoDistance.js";

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
    const [y, mo, d] = String(dateKey).split("-").map(Number);
    if (!y || !mo || !d) return null;
    return companyWallTimeOnDay(new Date(Date.UTC(y, mo - 1, d, 12, 0, 0)), h, min);
  };
  const a = parse(checkInStr);
  const b = parse(checkOutStr);
  if (!a || !b || b <= a) return "0h 0m";
  const totalMins = Math.floor((b - a) / 60000);
  return `${Math.floor(totalMins / 60)}h ${totalMins % 60}m`;
};

const resolveCheckInStatus = async (employee, punchedAt) => {
  const defaults = await getCompanyScheduleDefaults(employee.company);
  const schedule = resolveEmployeeSchedule(employee, defaults);
  const isWorkingDay = schedule.workingDays.includes(
    weekdayNameInCompanyTz(punchedAt)
  );
  if (!isWorkingDay) return "Working";

  const { hours, minutes } = parseOfficeStart(schedule.start);
  const threshold = companyWallTimeOnDay(
    punchedAt,
    hours,
    minutes + (schedule.lateThresholdMinutes || 0)
  );
  return punchedAt > threshold ? "Late" : "Working";
};

const branchIdOf = (employee) =>
  typeof employee.branch === "object" ? employee.branch._id : employee.branch;

const serializeSession = (session) => {
  if (!session) return null;
  const obj = typeof session.toObject === "function" ? session.toObject() : { ...session };
  return {
    ...obj,
    distanceLabel: formatDistanceKm(obj.distanceKm),
  };
};

const todayDistanceForEmployee = async (companyId, employeeId, date) => {
  const sessions = await FieldSession.find({
    company: companyId,
    employee: employeeId,
    date,
  }).select("distanceKm status checkIn checkOut");
  const distanceKm = sessions.reduce((sum, s) => sum + (Number(s.distanceKm) || 0), 0);
  return {
    distanceKm,
    distanceLabel: formatDistanceKm(distanceKm),
    sessionCount: sessions.length,
  };
};

const CHECKOUT_REMINDER_OFFSET_MINUTES = 15;
const CHECKOUT_REMINDER_INTERVAL_MINUTES = 15;

const buildShiftMeta = async (employee) => {
  const defaults = await getCompanyScheduleDefaults(employee.company);
  const schedule = resolveEmployeeSchedule(employee, defaults);
  return {
    shiftStart: schedule.start,
    shiftEnd: schedule.end,
    checkoutReminderOffsetMinutes: CHECKOUT_REMINDER_OFFSET_MINUTES,
    checkoutReminderIntervalMinutes: CHECKOUT_REMINDER_INTERVAL_MINUTES,
  };
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
  const [attendance, activeSession, distanceSummary, settings, shiftMeta] =
    await Promise.all([
      Attendance.findOne({
        company: employee.company,
        employee: employee._id,
        date: today,
      }),
      FieldSession.findOne({
        company: employee.company,
        employee: employee._id,
        status: "Open",
      }),
      todayDistanceForEmployee(employee.company, employee._id, today),
      Settings.findOne({ company: employee.company }).select("gpsRules"),
      buildShiftMeta(employee),
    ]);

  res.json({
    success: true,
    token,
    data: {
      ...sanitizeEmployee(employee),
      todayAttendance: attendance || null,
      activeFieldSession: serializeSession(activeSession),
      todayFieldDistance: distanceSummary,
      gpsRefreshSeconds: settings?.gpsRules?.refreshIntervalSeconds ?? 30,
      ...shiftMeta,
    },
  });
});

// @route  GET /api/field/me
export const fieldMe = asyncHandler(async (req, res) => {
  const today = toDateKey(new Date());
  const [attendance, tracking, activeSession, distanceSummary, settings, shiftMeta] =
    await Promise.all([
      Attendance.findOne({
        company: req.companyId,
        employee: req.employeeId,
        date: today,
      }),
      Tracking.findOne({
        company: req.companyId,
        employee: req.employeeId,
      }),
      FieldSession.findOne({
        company: req.companyId,
        employee: req.employeeId,
        status: "Open",
      }),
      todayDistanceForEmployee(req.companyId, req.employeeId, today),
      Settings.findOne({ company: req.companyId }).select("gpsRules"),
      buildShiftMeta(req.employee),
    ]);

  res.json({
    success: true,
    data: {
      ...sanitizeEmployee(req.employee),
      todayAttendance: attendance || null,
      tracking: tracking || null,
      activeFieldSession: serializeSession(activeSession),
      todayFieldDistance: distanceSummary,
      gpsRefreshSeconds: settings?.gpsRules?.refreshIntervalSeconds ?? 30,
      ...shiftMeta,
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

  const openSession = await FieldSession.findOne({
    company: req.companyId,
    employee: employee._id,
    status: "Open",
  });

  // Logout / explicit offline — always allow marking offline
  const forceOffline = online === false && !gpsDisabled;

  if (!openSession && !forceOffline) {
    // No field duty — keep map offline; do not accumulate distance
    const record = await Tracking.findOneAndUpdate(
      { company: req.companyId, employee: employee._id },
      {
        company: req.companyId,
        employee: employee._id,
        lat: lat ?? null,
        lng: lng ?? null,
        battery: battery ?? "--",
        speed: "--",
        location: location || "--",
        status: "Offline",
        online: false,
        lastUpdated: Date.now(),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    return res.json({
      success: true,
      data: record,
      fieldSession: null,
      message: "No open field session — tracking idle",
    });
  }

  let nextStatus = status;
  if (gpsDisabled === true) nextStatus = "GPS Disabled";
  if (!nextStatus) {
    if (online === false) nextStatus = "Offline";
    else if (Number(speed) > 0) nextStatus = "Moving";
    else nextStatus = "Stationary";
  }

  let sessionPayload = null;
  if (openSession && !forceOffline && lat != null && lng != null && !gpsDisabled) {
    const add = segmentKm(openSession.lastLat, openSession.lastLng, lat, lng);
    openSession.distanceKm = (Number(openSession.distanceKm) || 0) + add;
    openSession.lastLat = Number(lat);
    openSession.lastLng = Number(lng);
    openSession.pointCount = (openSession.pointCount || 0) + 1;
    await openSession.save();
    sessionPayload = serializeSession(openSession);
  } else if (openSession) {
    sessionPayload = serializeSession(openSession);
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
      status: forceOffline ? "Offline" : nextStatus,
      online: forceOffline || gpsDisabled ? false : online !== false,
      lastUpdated: Date.now(),
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.json({ success: true, data: record, fieldSession: sessionPayload });
});

// @route  POST /api/field/attendance/check-in  (starts field duty session)
export const fieldCheckIn = asyncHandler(async (req, res) => {
  const employee = req.employee;
  const now = new Date();
  const date = toDateKey(now);
  const checkIn = formatClock(now);
  const branchId = branchIdOf(employee);

  const existingOpen = await FieldSession.findOne({
    company: req.companyId,
    employee: employee._id,
    status: "Open",
  });
  if (existingOpen) {
    res.status(400);
    throw new Error("Field session already open — check out first");
  }

  const session = await FieldSession.create({
    company: req.companyId,
    employee: employee._id,
    branch: branchId,
    date,
    checkIn,
    checkOut: "--",
    startedAt: now,
    status: "Open",
    distanceKm: 0,
    lastLat: req.body.lat != null ? Number(req.body.lat) : null,
    lastLng: req.body.lng != null ? Number(req.body.lng) : null,
    pointCount: req.body.lat != null ? 1 : 0,
  });

  // Office attendance: only create/update if no biometric (or empty) record yet
  let attendance = await Attendance.findOne({
    company: req.companyId,
    employee: employee._id,
    date,
  });

  if (!attendance) {
    const status = await resolveCheckInStatus(employee, now);
    attendance = await Attendance.create({
      company: req.companyId,
      employee: employee._id,
      branch: branchId,
      date,
      checkIn,
      checkOut: "--",
      hours: "--",
      method: "GPS",
      status,
    });
  } else if (
    (!attendance.checkIn || attendance.checkIn === "--") &&
    attendance.method !== "Biometric"
  ) {
    attendance.checkIn = checkIn;
    attendance.method = "GPS";
    attendance.status = await resolveCheckInStatus(employee, now);
    await attendance.save();
  }
  // If Biometric already present — leave Attendance untouched

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

  const distanceSummary = await todayDistanceForEmployee(
    req.companyId,
    employee._id,
    date
  );
  const shiftMeta = await buildShiftMeta(employee);

  res.status(201).json({
    success: true,
    data: {
      fieldSession: serializeSession(session),
      todayAttendance: attendance,
      todayFieldDistance: distanceSummary,
      ...shiftMeta,
    },
  });
});

// @route  POST /api/field/attendance/check-out  (ends field duty session)
export const fieldCheckOut = asyncHandler(async (req, res) => {
  const employee = req.employee;
  const now = new Date();
  const date = toDateKey(now);
  const checkOut = formatClock(now);

  const session = await FieldSession.findOne({
    company: req.companyId,
    employee: employee._id,
    status: "Open",
  });

  if (!session) {
    res.status(400);
    throw new Error("No open field session — check in first");
  }

  if (req.body.lat != null && req.body.lng != null) {
    const add = segmentKm(
      session.lastLat,
      session.lastLng,
      req.body.lat,
      req.body.lng
    );
    session.distanceKm = (Number(session.distanceKm) || 0) + add;
    session.lastLat = Number(req.body.lat);
    session.lastLng = Number(req.body.lng);
    session.pointCount = (session.pointCount || 0) + 1;
  }

  session.checkOut = checkOut;
  session.endedAt = now;
  session.status = "Closed";
  session.closedReason = "manual";
  await session.save();

  // Only close GPS attendance row; never overwrite biometric check-out times
  const attendance = await Attendance.findOne({
    company: req.companyId,
    employee: employee._id,
    date,
  });

  if (
    attendance &&
    attendance.method === "GPS" &&
    (!attendance.checkOut || attendance.checkOut === "--")
  ) {
    attendance.checkOut = checkOut;
    attendance.hours = computeHours(attendance.checkIn, checkOut, date);
    if (attendance.status === "Working") attendance.status = "Present";
    await attendance.save();
  }

  await Tracking.findOneAndUpdate(
    { company: req.companyId, employee: employee._id },
    {
      online: false,
      status: "Offline",
      lastUpdated: Date.now(),
      ...(req.body.lat != null ? { lat: req.body.lat, lng: req.body.lng } : {}),
    }
  );

  const distanceSummary = await todayDistanceForEmployee(
    req.companyId,
    employee._id,
    date
  );

  res.json({
    success: true,
    data: {
      fieldSession: serializeSession(session),
      todayAttendance: attendance,
      todayFieldDistance: distanceSummary,
    },
  });
});
