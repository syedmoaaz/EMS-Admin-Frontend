const headers = (deviceSecret) => ({
  "Content-Type": "application/json",
  "X-Device-Secret": deviceSecret,
});

export async function deviceMe(apiUrl, deviceSecret) {
  const res = await fetch(`${apiUrl}/device/me`, {
    headers: headers(deviceSecret),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Auth failed (${res.status})`);
  }
  return data.data;
}

export async function heartbeat(apiUrl, deviceSecret, payload = {}) {
  const res = await fetch(`${apiUrl}/device/heartbeat`, {
    method: "POST",
    headers: headers(deviceSecret),
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Heartbeat failed (${res.status})`);
  }
  return data.data;
}

export async function ingestAttendance(apiUrl, deviceSecret, punches, deviceSerial = "") {
  const res = await fetch(`${apiUrl}/device/attendance/ingest`, {
    method: "POST",
    headers: headers(deviceSecret),
    body: JSON.stringify({ punches, deviceSerial }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Ingest failed (${res.status})`);
  }
  return data.data;
}
