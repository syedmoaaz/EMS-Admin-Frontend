const headers = (deviceSecret) => ({
  "Content-Type": "application/json",
  "X-Device-Secret": deviceSecret,
});

const withTimeout = async (promise, ms = 20000) => {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`Request timed out after ${ms}ms`)),
          ms
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
};

export async function deviceMe(apiUrl, deviceSecret) {
  const res = await withTimeout(
    fetch(`${apiUrl}/device/me`, {
      headers: headers(deviceSecret),
    })
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Auth failed (${res.status})`);
  }
  return data.data;
}

export async function heartbeat(apiUrl, deviceSecret, payload = {}) {
  const res = await withTimeout(
    fetch(`${apiUrl}/device/heartbeat`, {
      method: "POST",
      headers: headers(deviceSecret),
      body: JSON.stringify(payload),
    })
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Heartbeat failed (${res.status})`);
  }
  return data.data;
}

export async function ingestAttendance(
  apiUrl,
  deviceSecret,
  punches,
  deviceSerial = ""
) {
  const res = await withTimeout(
    fetch(`${apiUrl}/device/attendance/ingest`, {
      method: "POST",
      headers: headers(deviceSecret),
      body: JSON.stringify({ punches, deviceSerial }),
    }),
    30000
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.message || `Ingest failed (${res.status})`);
    err.status = res.status;
    err.retryable = !res.status || res.status >= 500 || res.status === 429;
    throw err;
  }
  return data.data;
}

/** Lightweight connectivity check (does not require valid secret to detect network). */
export async function isOnline(apiUrl) {
  try {
    const base = String(apiUrl || "").replace(/\/$/, "");
    const healthUrl = base.endsWith("/api")
      ? `${base}/health`
      : `${base}/api/health`;
    const res = await withTimeout(fetch(healthUrl), 8000);
    return res.ok;
  } catch {
    return false;
  }
}
