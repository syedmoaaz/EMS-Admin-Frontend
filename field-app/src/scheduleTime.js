/** Pakistan (Asia/Karachi) wall-clock helpers for local reminder scheduling. */

const PK_OFFSET_MS = 5 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, "0");

const getParts = (date) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date instanceof Date ? date : new Date(date));

const part = (parts, type) => parts.find((p) => p.type === type)?.value;

export function toDateKey(date = new Date()) {
  const parts = getParts(date);
  return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
}

/**
 * UTC Date for a Pakistan wall-clock time on the same local day as dayDate.
 */
export function companyWallTimeOnDay(dayDate, hours, minutes = 0) {
  const dateKey = toDateKey(dayDate);
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, hours, minutes, 0, 0) - PK_OFFSET_MS);
}

export function formatLocalClock(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Karachi",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).formatToParts(date);
  const hour = pad(Number(part(parts, "hour")));
  const minute = part(parts, "minute");
  const ampm = (part(parts, "dayPeriod") || "").toUpperCase();
  return `${hour}:${minute} ${ampm}`;
}
