import Employee from "../models/Employee.js";
import { DEVICE_PIN_RE, EMPLOYEE_ID_RE } from "../models/Employee.js";

export const normalizeCityCode = (value) =>
  String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 5);

export const normalizeEmployeeId = (value) =>
  String(value || "").trim().toUpperCase();

/** Strip leading zeros; K50 cannot use them */
export const normalizeDevicePin = (value) => {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  // Allow numeric from device as "101" or number 101
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const normalized = String(Number(digits)); // drops leading zeros → "01" → "1"
  if (normalized === "0") return ""; // pin 0 not allowed
  return normalized;
};

export const isValidEmployeeId = (value) =>
  EMPLOYEE_ID_RE.test(normalizeEmployeeId(value));

export const isValidDevicePin = (value) =>
  DEVICE_PIN_RE.test(normalizeDevicePin(value));

/**
 * Next employeeId for a city code within a company: THT-1, THT-2, ...
 */
export async function nextEmployeeIdForCity(companyId, cityCode) {
  const code = normalizeCityCode(cityCode);
  if (!code) {
    throw new Error("Branch city code is required to generate employee ID");
  }

  const prefix = `${code}-`;
  const existing = await Employee.find({
    company: companyId,
    employeeId: new RegExp(`^${code}-[1-9][0-9]*$`),
  })
    .select("employeeId")
    .lean();

  let max = 0;
  for (const row of existing) {
    const part = String(row.employeeId).slice(prefix.length);
    const n = Number(part);
    if (!Number.isNaN(n) && n > max) max = n;
  }

  return `${code}-${max + 1}`;
}

/**
 * Next company-wide numeric device PIN: 1, 2, 3, ...
 */
export async function nextDevicePin(companyId) {
  const existing = await Employee.find({ company: companyId })
    .select("devicePin")
    .lean();

  let max = 0;
  for (const row of existing) {
    const n = Number(row.devicePin);
    if (!Number.isNaN(n) && n > max) max = n;
  }

  return String(max + 1);
}
