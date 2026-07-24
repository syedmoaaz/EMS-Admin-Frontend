/**
 * Shared ZK punch helpers (from ZKTECO-ADVANCED-CURSOR-AGENT patterns).
 * EMS Device PIN: digits only, no leading zero — do not pad.
 */

export const normalizeDevicePin = (id) => {
  if (id === null || id === undefined || id === "") return null;
  const raw = String(id).trim();
  if (!/^\d+$/.test(raw)) return raw;
  // Strip leading zeros for K50/EMS rule (except bare "0" which is invalid anyway)
  const n = String(Number(raw));
  if (n === "0" || Number.isNaN(Number(raw))) return null;
  return n;
};

export const toIsoTime = (recordTime) => {
  if (!recordTime) return null;
  if (recordTime instanceof Date) return recordTime.toISOString();
  const d = new Date(recordTime);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return String(recordTime);
};

/**
 * Decide if a device log is after the checkpoint.
 * Handles userSn wrap: newer time + smaller serial still counts as new.
 */
export const isAfterCheckpoint = (log, lastSerial, lastTime) => {
  if (lastSerial === null || lastSerial === undefined) return true;

  const sn = Number(log.userSn ?? log.serialNo);
  const time = toIsoTime(log.recordTime || log.punchedAt);
  const lastT = lastTime ? toIsoTime(lastTime) : null;

  if (lastT && time) {
    if (time > lastT) return true;
    if (time < lastT) return false;
  }

  if (sn > lastSerial) return true;

  if (sn < lastSerial && lastT && time && time >= lastT) {
    const drop = lastSerial - sn;
    if (drop > 1000) return true;
  }

  return false;
};

export const sortLogs = (logs) =>
  [...logs].sort((a, b) => {
    const ta = toIsoTime(a.recordTime || a.punchedAt) || "";
    const tb = toIsoTime(b.recordTime || b.punchedAt) || "";
    if (ta !== tb) return ta < tb ? -1 : 1;
    return Number(a.userSn ?? a.serialNo) - Number(b.userSn ?? b.serialNo);
  });

export const mapRawLog = (row) => {
  const punchedAt = toIsoTime(
    row.recordTime || row.timestamp || row.attTime || row.time
  );
  if (!punchedAt) return null;

  const devicePin = normalizeDevicePin(
    row.deviceUserId ?? row.uid ?? row.id ?? row.userId
  );
  if (!devicePin) return null;

  const serialNo = Number(row.userSn ?? row.serialNo);
  const date = punchedAt.slice(0, 10);

  return {
    employeeId: devicePin,
    devicePin,
    punchedAt,
    date,
    serialNo: Number.isNaN(serialNo) ? null : serialNo,
    deviceSerial: row.sn || "",
    userSn: Number.isNaN(serialNo) ? null : serialNo,
    recordTime: punchedAt,
  };
};
