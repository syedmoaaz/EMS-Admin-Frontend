import Settings from "../models/Settings.js";

export const DEFAULT_WORKING_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const formatShiftTiming = (start, end) => {
  const s = String(start || "").trim();
  const e = String(end || "").trim();
  if (!s && !e) return "";
  if (s && e) return `${s} - ${e}`;
  return s || e;
};

/** Company settings used as defaults when creating employees / fallback for legacy docs. */
export const getCompanyScheduleDefaults = async (companyId) => {
  const settings = await Settings.findOne({ company: companyId }).lean();

  return {
    start: settings?.officeTimings?.start || "09:00 AM",
    end: settings?.officeTimings?.end || "06:00 PM",
    lateThresholdMinutes: settings?.attendanceRules?.lateThresholdMinutes ?? 15,
    halfDayHours: settings?.attendanceRules?.halfDayHours ?? 4,
    fullDayHours: settings?.attendanceRules?.fullDayHours ?? 8,
    workingDays:
      settings?.workingDays?.length > 0
        ? settings.workingDays
        : DEFAULT_WORKING_DAYS,
  };
};

/**
 * Resolve effective schedule for an employee.
 * Employee workSchedule wins; missing fields fall back to company settings.
 */
export const resolveEmployeeSchedule = (employee, companyDefaults) => {
  const ws = employee?.workSchedule || {};
  const defaults = companyDefaults || {
    start: "09:00 AM",
    end: "06:00 PM",
    lateThresholdMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
    workingDays: DEFAULT_WORKING_DAYS,
  };

  return {
    start: ws.start || defaults.start,
    end: ws.end || defaults.end,
    lateThresholdMinutes:
      ws.lateThresholdMinutes ?? defaults.lateThresholdMinutes,
    halfDayHours: ws.halfDayHours ?? defaults.halfDayHours,
    fullDayHours: ws.fullDayHours ?? defaults.fullDayHours,
    workingDays:
      Array.isArray(ws.workingDays) && ws.workingDays.length > 0
        ? ws.workingDays
        : defaults.workingDays,
  };
};

export const normalizeWorkScheduleInput = (input, defaults) => {
  const base = defaults || {
    start: "09:00 AM",
    end: "06:00 PM",
    lateThresholdMinutes: 15,
    halfDayHours: 4,
    fullDayHours: 8,
    workingDays: DEFAULT_WORKING_DAYS,
  };

  if (!input || typeof input !== "object") {
    return { ...base };
  }

  const workingDays = Array.isArray(input.workingDays)
    ? input.workingDays.filter(Boolean)
    : base.workingDays;

  return {
    start: String(input.start || base.start).trim() || base.start,
    end: String(input.end || base.end).trim() || base.end,
    lateThresholdMinutes: Number.isFinite(Number(input.lateThresholdMinutes))
      ? Math.max(0, Number(input.lateThresholdMinutes))
      : base.lateThresholdMinutes,
    halfDayHours: Number.isFinite(Number(input.halfDayHours))
      ? Math.max(0, Number(input.halfDayHours))
      : base.halfDayHours,
    fullDayHours: Number.isFinite(Number(input.fullDayHours))
      ? Math.max(1, Number(input.fullDayHours))
      : base.fullDayHours,
    workingDays: workingDays.length > 0 ? workingDays : base.workingDays,
  };
};
