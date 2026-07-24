import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import { pushTracking } from "./auth";
import { enqueuePoint, flushOutbox, getOutboxCount } from "./outbox";

const DEFAULT_INTERVAL_MS = 30_000;

let watchSub = null;
let intervalId = null;
let lastCoords = null;
let onStatus = null;

export function setTrackingStatusHandler(fn) {
  onStatus = fn;
}

function emit(status) {
  onStatus?.(status);
}

async function buildPayload({ gpsDisabled = false } = {}) {
  const net = await NetInfo.fetch();
  const online = Boolean(net.isConnected);

  if (gpsDisabled || !lastCoords) {
    return {
      lat: lastCoords?.latitude ?? null,
      lng: lastCoords?.longitude ?? null,
      speed: lastCoords?.speed != null ? String(Math.max(0, lastCoords.speed)) : "--",
      battery: "--",
      location: "--",
      online: false,
      gpsDisabled: true,
      status: "GPS Disabled",
    };
  }

  const speed = lastCoords.speed != null ? Math.max(0, lastCoords.speed) : 0;

  return {
    lat: lastCoords.latitude,
    lng: lastCoords.longitude,
    speed: String(speed.toFixed(1)),
    battery: "--",
    location: "--",
    online,
    gpsDisabled: false,
    status: speed > 0.5 ? "Moving" : "Stationary",
  };
}

async function sendOrQueue(token, payload) {
  const net = await NetInfo.fetch();
  if (!net.isConnected) {
    const count = await enqueuePoint(payload);
    emit({ online: false, pending: count, lastError: "Offline — queued" });
    return;
  }

  try {
    await pushTracking(token, payload);
    const flush = await flushOutbox((p) => pushTracking(token, p));
    const pending = await getOutboxCount();
    emit({
      online: true,
      pending,
      lastError: null,
      flushed: flush.flushed,
      status: payload.status,
    });
  } catch (err) {
    const count = await enqueuePoint(payload);
    emit({
      online: true,
      pending: count,
      lastError: err.message || "Upload failed",
    });
  }
}

export async function requestLocationPermission() {
  const fg = await Location.requestForegroundPermissionsAsync();
  if (fg.status !== "granted") {
    return { granted: false, background: false };
  }

  let background = false;
  try {
    const bg = await Location.requestBackgroundPermissionsAsync();
    background = bg.status === "granted";
  } catch {
    background = false;
  }

  return { granted: true, background };
}

export async function readCurrentPosition() {
  try {
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    lastCoords = pos.coords;
    return pos.coords;
  } catch {
    return null;
  }
}

export async function startTracking(token, intervalMs = DEFAULT_INTERVAL_MS) {
  stopTracking();

  const perm = await requestLocationPermission();
  if (!perm.granted) {
    const payload = await buildPayload({ gpsDisabled: true });
    await sendOrQueue(token, payload);
    emit({ gpsDenied: true, pending: await getOutboxCount() });
    return { ok: false, reason: "permission" };
  }

  watchSub = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: intervalMs,
      distanceInterval: 15,
    },
    (pos) => {
      lastCoords = pos.coords;
    }
  );

  // Immediate ping
  await readCurrentPosition();
  const first = await buildPayload();
  await sendOrQueue(token, first);

  intervalId = setInterval(async () => {
    const services = await Location.hasServicesEnabledAsync();
    if (!services) {
      await sendOrQueue(token, await buildPayload({ gpsDisabled: true }));
      return;
    }
    if (!lastCoords) await readCurrentPosition();
    await sendOrQueue(token, await buildPayload());
  }, intervalMs);

  emit({ running: true, gpsDenied: false });
  return { ok: true };
}

export function stopTracking() {
  if (watchSub) {
    watchSub.remove();
    watchSub = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  emit({ running: false });
}

export async function flushNow(token) {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return { flushed: 0 };
  return flushOutbox((p) => pushTracking(token, p));
}
