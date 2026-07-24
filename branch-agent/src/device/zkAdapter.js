/**
 * ZKTeco LAN pull adapter (TCP 4370, UDP fallback via node-zklib when available).
 * Patterns from https://github.com/syedmoaaz/ZKTECO-ADVANCED-CURSOR-AGENT
 * Never clears device attendance logs by default.
 */
import { logger } from "../logger.js";
import {
  mapRawLog,
  sortLogs,
  toIsoTime,
} from "./punchHelpers.js";

async function loadZkLib() {
  try {
    const mod = await import("node-zklib");
    return mod.default || mod.ZKLib || mod;
  } catch {
    /* try legacy package name */
  }
  try {
    const mod = await import("zklib");
    return mod.default || mod.ZKLib || mod;
  } catch {
    throw new Error(
      "Install a ZK client: npm install node-zklib (preferred) or zklib. Or set deviceMode=mock."
    );
  }
}

/**
 * Fetch all attendance rows from device (sorted).
 * @returns {{ ok: boolean, logs: object[], error?: string }}
 */
export async function fetchAttendances({ deviceIp, devicePort = 4370 } = {}) {
  const ZKLib = await loadZkLib();
  const zk = new ZKLib(deviceIp, devicePort, 10000, 4000);

  try {
    await zk.createSocket();
  } catch (err) {
    logger.warn("Device connection failed", err.message || String(err));
    return { ok: false, logs: [], error: err.message || String(err) };
  }

  try {
    const result = await zk.getAttendances();
    const raw = result?.data || result || [];
    const logs = sortLogs(Array.isArray(raw) ? raw : []);
    return { ok: true, logs, error: null };
  } catch (err) {
    logger.warn("Device error", err.message || String(err));
    return { ok: false, logs: [], error: err.message || String(err) };
  } finally {
    try {
      await zk.disconnect();
    } catch {
      /* ignore */
    }
  }
}

/** Map device rows → EMS punch objects */
export function mapDeviceLogs(rawLogs) {
  return (rawLogs || []).map(mapRawLog).filter(Boolean);
}

export async function fetchPunches(opts) {
  const { ok, logs, error } = await fetchAttendances(opts);
  if (!ok) {
    throw new Error(error || "Cannot connect to ZK device");
  }
  return mapDeviceLogs(logs);
}

export async function fetchPunchesForToday(opts) {
  const punches = await fetchPunches(opts);
  const today = toIsoTime(new Date())?.slice(0, 10);
  return punches.filter((p) => p.date === today);
}

export async function clearAttendanceLog({ deviceIp, devicePort = 4370 } = {}) {
  const ZKLib = await loadZkLib();
  const zk = new ZKLib(deviceIp, devicePort, 10000, 4000);
  try {
    await zk.createSocket();
    await zk.clearAttendanceLog();
    logger.info("Cleared device attendance log");
    return true;
  } catch (err) {
    logger.warn("Failed to clear device log", err.message || String(err));
    return false;
  } finally {
    try {
      await zk.disconnect();
    } catch {
      /* ignore */
    }
  }
}
