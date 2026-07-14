/**
 * ZKTeco LAN pull adapter (TCP 4370).
 * Uses optional `zklib` if installed. Falls back with a clear error.
 */
const toDateKey = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export async function fetchPunchesForToday({ deviceIp, devicePort = 4370 }) {
  let ZKLib;
  try {
    const mod = await import("zklib");
    ZKLib = mod.default || mod.ZKLib || mod;
  } catch {
    throw new Error(
      "zklib is not installed. Run npm install in branch-agent, or set deviceMode=mock."
    );
  }

  const zk = new ZKLib(deviceIp, devicePort, 10000, 4000);

  try {
    await zk.createSocket();
  } catch (err) {
    throw new Error(`Cannot connect to ZK device at ${deviceIp}:${devicePort} — ${err.message}`);
  }

  try {
    const result = await zk.getAttendances();
    const list = result?.data || result || [];
    const today = toDateKey(new Date());

    return list
      .map((row) => {
        const punchedAt = new Date(
          row.recordTime || row.timestamp || row.attTime || row.time
        );
        if (Number.isNaN(punchedAt.getTime())) return null;
        if (toDateKey(punchedAt) !== today) return null;

        return {
          employeeId: String(row.deviceUserId || row.uid || row.userSn || row.id || ""),
          punchedAt: punchedAt.toISOString(),
          date: today,
          deviceSerial: row.sn || "",
        };
      })
      .filter((p) => p && p.employeeId);
  } finally {
    try {
      await zk.disconnect();
    } catch {
      /* ignore */
    }
  }
}
