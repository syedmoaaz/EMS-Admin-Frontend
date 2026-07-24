export async function fetchPunches({ deviceIp, devicePort }) {
  console.log(
    `[mock] Would poll device ${deviceIp}:${devicePort} — no punches`
  );
  return [];
}

export async function fetchPunchesForToday(opts) {
  return fetchPunches(opts);
}

/**
 * EMS_MOCK_PUNCHES='[{"employeeId":"11","punchedAt":"2026-07-24T09:05:00.000Z","serialNo":1}]'
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
