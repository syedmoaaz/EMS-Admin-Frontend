/** Company timezone — Pakistan (no DST). Used for attendance clocks & late rules. */
export const COMPANY_TZ = process.env.COMPANY_TZ || "Asia/Karachi";

/** Pakistan is UTC+5 year-round */
const PK_OFFSET_MS = 5 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, "0");

const getParts = (date, options) => {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    timeZone: COMPANY_TZ,
    ...options,
  }).formatToParts(d);
};

const part = (parts, type) => parts.find((p) => p.type === type)?.value;

/** YYYY-MM-DD in company timezone */
export const toDateKey = (date = new Date()) => {
  const parts = getParts(date, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
};

/** e.g. 07:12 PM in company timezone */
export const formatClock = (date) => {
  const parts = getParts(date, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const hour = pad(Number(part(parts, "hour")));
  const minute = part(parts, "minute");
  const ampm = (part(parts, "dayPeriod") || "").toUpperCase();
  return `${hour}:${minute} ${ampm}`;
};

export const weekdayNameInCompanyTz = (date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: COMPANY_TZ,
    weekday: "long",
  }).format(date instanceof Date ? date : new Date(date));

/**
 * Build a UTC Date for a wall-clock time on the same company-local day as `dayDate`.
 * hours/minutes are company-local (e.g. 9, 15 for 09:15 AM PKT).
 */
export const companyWallTimeOnDay = (dayDate, hours, minutes = 0) => {
  const dateKey = toDateKey(dayDate);
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(
    Date.UTC(y, m - 1, d, hours, minutes, 0, 0) - PK_OFFSET_MS
  );
};
