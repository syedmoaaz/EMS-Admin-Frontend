/**
 * Mock adapter — generates no punches by default; use for wiring tests.
 * Replace with zkAdapter when a K50 is on LAN.
 */
export async function fetchPunchesForToday({ deviceIp, devicePort }) {
  console.log(
    `[mock] Would poll device ${deviceIp}:${devicePort} — no punches (set deviceMode=zk when ready)`
  );
  return [];
}

/**
 * Optional helper to fake a punch for API testing via CLI:
 * EMS_MOCK_PUNCHES='[{"employeeId":"EMP-0001","punchedAt":"2026-07-14T09:05:00"}]'
 */
export function punchesFromEnv() {
  const raw = process.env.EMS_MOCK_PUNCHES;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
