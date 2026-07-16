import Attendance from "../models/Attendance.js";
import AttendanceLog from "../models/AttendanceLog.js";
import Employee from "../models/Employee.js";
import Settings from "../models/Settings.js";
import { normalizeDevicePin } from "../utils/employeeIds.js";

const pad = (n) => String(n).padStart(2, "0");

export const toDateKey = (date = new Date()) => {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export const formatClock = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  let hours = d.getHours();
  const minutes = pad(d.getMinutes());
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${pad(hours)}:${minutes} ${ampm}`;
};

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

const computeHours = (first, last) => {
  const ms = last.getTime() - first.getTime();
  if (ms <= 0) return "0h 0m";
  const totalMins = Math.floor(ms / 60000);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${h}h ${m}m`;
};

const resolveStatus = ({
  firstPunch,
  officeStart,
  lateThresholdMinutes,
  hasCheckout,
}) => {
  const { hours, minutes } = parseOfficeStart(officeStart);
  const threshold = new Date(firstPunch);
  threshold.setHours(hours, minutes + lateThresholdMinutes, 0, 0);

  if (!hasCheckout) {
    return firstPunch > threshold ? "Late" : "Working";
  }

  return firstPunch > threshold ? "Late" : "Present";
};

/**
 * Match K50 User ID / device PIN to an EMS employee.
 * Payload may send employeeId, deviceUserId, or devicePin — all mean the numeric PIN.
 */
export const findEmployeeByDevicePin = async (companyId, rawPin) => {
  const devicePin = normalizeDevicePin(rawPin);
  if (!devicePin) return null;

  return Employee.findOne({
    company: companyId,
    devicePin,
    status: "Active",
  });
};

/**
 * Recompute daily Attendance for one devicePin/branch/date from AttendanceLog.
 * AttendanceLog.employeeId stores the device PIN string from the machine.
 */
export const deriveDailyAttendance = async ({
  companyId,
  branchId,
  employeeId: devicePinKey,
  date,
}) => {
  const devicePin = normalizeDevicePin(devicePinKey);
  const logs = await AttendanceLog.find({
    company: companyId,
    branch: branchId,
    employeeId: devicePin,
    date,
  }).sort({ punchedAt: 1 });

  if (!logs.length) return null;

  const employee =
    logs.find((l) => l.employee)?.employee ||
    (await findEmployeeByDevicePin(companyId, devicePin))?._id;

  if (!employee) {
    return null;
  }

  const first = logs[0].punchedAt;
  const last = logs[logs.length - 1].punchedAt;
  const hasCheckout = logs.length > 1;

  const settings = await Settings.findOne({ company: companyId }).lean();
  const officeStart = settings?.officeTimings?.start || "09:00 AM";
  const lateThresholdMinutes =
    settings?.attendanceRules?.lateThresholdMinutes ?? 15;

  const status = resolveStatus({
    firstPunch: first,
    officeStart,
    lateThresholdMinutes,
    hasCheckout,
  });

  const payload = {
    company: companyId,
    employee,
    branch: branchId,
    date,
    checkIn: formatClock(first),
    checkOut: hasCheckout ? formatClock(last) : "--",
    hours: hasCheckout ? computeHours(first, last) : "--",
    method: "Biometric",
    status,
  };

  return Attendance.findOneAndUpdate(
    { company: companyId, employee, date },
    payload,
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
};

/**
 * Ingest a batch of punches for a branch (company/branch already authenticated).
 * Punch identity from device is the numeric PIN (not EMS employeeId like THT-1).
 */
export const ingestPunches = async ({
  companyId,
  branchId,
  punches = [],
  deviceSerial = "",
}) => {
  const summary = {
    received: punches.length,
    inserted: 0,
    duplicates: 0,
    unmatched: 0,
    derived: 0,
    errors: [],
  };

  const touched = new Map();

  for (const punch of punches) {
    try {
      const devicePin = normalizeDevicePin(
        punch.devicePin || punch.deviceUserId || punch.employeeId || ""
      );
      const punchedAt = new Date(punch.punchedAt || punch.timestamp);

      if (!devicePin || Number.isNaN(punchedAt.getTime())) {
        summary.errors.push({
          punch,
          message: "Invalid devicePin/employeeId or punchedAt",
        });
        continue;
      }

      const date = punch.date || toDateKey(punchedAt);
      const employee = await findEmployeeByDevicePin(companyId, devicePin);

      try {
        await AttendanceLog.create({
          company: companyId,
          branch: branchId,
          employee: employee?._id || null,
          employeeId: devicePin, // store PIN in log key field
          punchedAt,
          date,
          deviceSerial: deviceSerial || punch.deviceSerial || "",
          unmatched: !employee,
          raw: punch,
        });
        summary.inserted += 1;
        if (!employee) summary.unmatched += 1;
        touched.set(`${devicePin}|${date}`, { employeeId: devicePin, date });
      } catch (err) {
        if (err?.code === 11000) {
          summary.duplicates += 1;
          touched.set(`${devicePin}|${date}`, { employeeId: devicePin, date });
        } else {
          summary.errors.push({ devicePin, message: err.message });
        }
      }
    } catch (err) {
      summary.errors.push({ message: err.message });
    }
  }

  for (const { employeeId, date } of touched.values()) {
    const derived = await deriveDailyAttendance({
      companyId,
      branchId,
      employeeId,
      date,
    });
    if (derived) summary.derived += 1;
  }

  return summary;
};
