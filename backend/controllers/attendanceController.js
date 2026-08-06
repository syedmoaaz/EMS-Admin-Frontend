import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import asyncHandler from "../utils/asyncHandler.js";
import { companyQuery } from "../utils/companyScope.js";
import {
  getCompanyScheduleDefaults,
  resolveEmployeeSchedule,
} from "../utils/workSchedule.js";
import {
  companyWallTimeOnDay,
  weekdayNameInCompanyTz,
} from "../utils/companyTime.js";

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

const parseCheckInClock = (clock, dateKey) => {
  const m = String(clock || "")
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

const formatClockFromTimeInput = (timeHHmm) => {
  const raw = String(timeHHmm || "").trim();
  // Accept "09:15 AM" already
  if (/AM|PM/i.test(raw)) return raw.toUpperCase().replace(/\s+/g, " ");
  const m = raw.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2];
  const ampm = h >= 12 ? "PM" : "AM";
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  return `${String(h).padStart(2, "0")}:${min} ${ampm}`;
};

const resolveManualStatus = async (employeeDoc, dateKey, checkInClock) => {
  const punchedAt = parseCheckInClock(checkInClock, dateKey);
  if (!punchedAt) return "Working";

  const defaults = await getCompanyScheduleDefaults(employeeDoc.company);
  const schedule = resolveEmployeeSchedule(employeeDoc, defaults);
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
  // Match biometric: first punch, no check-out → Late or Working
  return punchedAt > threshold ? "Late" : "Working";
};

// @route  GET /api/attendance
export const getAttendance = asyncHandler(async (req, res) => {
  const { date, status, method, branch, search } = req.query;
  const query = companyQuery(req);

  if (date) query.date = date;
  if (status && status !== "all") query.status = status;
  if (method && method !== "all") query.method = method;
  if (branch && branch !== "all") query.branch = branch;

  let records = await Attendance.find(query)
    .populate({
      path: "employee",
      select: "name employeeId image branch",
      populate: { path: "branch", select: "name" },
    })
    .populate("branch", "name")
    .sort({ createdAt: -1 });

  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    records = records.filter((record) => {
      const emp = record.employee;
      if (!emp) return false;
      return (
        emp.name?.toLowerCase().includes(term) ||
        emp.employeeId?.toLowerCase().includes(term)
      );
    });
  }

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
      present: records.filter(
        (r) => r.status === "Present" || r.status === "Working"
      ).length,
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

/**
 * Manual (or admin) attendance — check-in time only.
 * First / only mark for the day; check-out and hours stay "--".
 * @route  POST /api/attendance
 */
export const createAttendance = asyncHandler(async (req, res) => {
  const { employee, date, branch, checkIn, note, status: bodyStatus } = req.body;

  if (!employee || !date) {
    res.status(400);
    throw new Error("Employee and date are required");
  }

  const employeeDoc = await Employee.findOne(
    companyQuery(req, { _id: employee })
  );

  if (!employeeDoc) {
    res.status(404);
    throw new Error("Employee not found");
  }

  const checkInClock = formatClockFromTimeInput(checkIn);
  if (!checkInClock) {
    res.status(400);
    throw new Error("Check-in time is required (e.g. 09:15 AM or 09:15)");
  }

  const existing = await Attendance.findOne({
    company: req.companyId,
    employee,
    date,
  });

  if (existing?.checkIn && existing.checkIn !== "--") {
    res.status(400);
    throw new Error(
      "Attendance already marked for this employee on this date"
    );
  }

  const status =
    bodyStatus && ["Present", "Late", "Working", "On Leave", "Absent"].includes(bodyStatus)
      ? bodyStatus
      : await resolveManualStatus(employeeDoc, date, checkInClock);

  const record = await Attendance.findOneAndUpdate(
    { company: req.companyId, employee, date },
    {
      company: req.companyId,
      employee,
      branch: branch || employeeDoc.branch,
      date,
      checkIn: checkInClock,
      checkOut: "--",
      hours: "--",
      method: "Manual",
      status,
      note: String(note || "").trim(),
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const populated = await Attendance.findById(record._id)
    .populate({
      path: "employee",
      select: "name employeeId image branch",
      populate: { path: "branch", select: "name" },
    })
    .populate("branch", "name");

  res.status(201).json({ success: true, data: populated });
});
