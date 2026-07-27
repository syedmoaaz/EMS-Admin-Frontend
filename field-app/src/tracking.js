import * as Location from "expo-location";
import * as Battery from "expo-battery";
import * as TaskManager from "expo-task-manager";
import NetInfo from "@react-native-community/netinfo";
import { pushTracking } from "./auth";
import { enqueuePoint, flushOutbox, getOutboxCount } from "./outbox";
import { BACKGROUND_LOCATION_TASK } from "./backgroundLocationTask";

const DEFAULT_INTERVAL_MS = 30_000;

let watchSub = null;
let intervalId = null;
let lastCoords = null;
let onStatus = null;
let backgroundActive = false;

export function setTrackingStatusHandler(fn) {
  onStatus = fn;
}

function emit(status) {
  onStatus?.(status);
}

async function readBatteryLabel() {
  try {
    const level = await Battery.getBatteryLevelAsync();
    if (level == null || level < 0) return "--";
    return `${Math.round(level * 100)}%`;
  } catch {
    return "--";
  }
}

async function buildPayload({ gpsDisabled = false, forceOffline = false } = {}) {
  const net = await NetInfo.fetch();
  const netOnline = Boolean(net.isConnected);
  const battery = await readBatteryLabel();

  if (forceOffline) {
    return {
      lat: lastCoords?.latitude ?? null,
      lng: lastCoords?.longitude ?? null,
      speed: "--",
      battery,
      location: "--",
      online: false,
      gpsDisabled: false,
      status: "Offline",
    };
  }

  if (gpsDisabled || !lastCoords) {
    return {
      lat: lastCoords?.latitude ?? null,
      lng: lastCoords?.longitude ?? null,
      speed:
        lastCoords?.speed != null
          ? String(Math.max(0, lastCoords.speed))
          : "--",
      battery,
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
    battery,
    location: "--",
    online: netOnline,
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

async function stopForegroundWatch() {
  if (watchSub) {
    watchSub.remove();
    watchSub = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

async function stopBackgroundUpdates() {
  try {
    const started = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    );
    if (started) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  } catch {
    // Expo Go / unsupported — ignore
  }
  backgroundActive = false;
}

async function startBackgroundUpdates(intervalMs) {
  try {
    const available = await TaskManager.isAvailableAsync();
    if (!available) return false;

    const already = await Location.hasStartedLocationUpdatesAsync(
      BACKGROUND_LOCATION_TASK
    );
    if (already) {
      backgroundActive = true;
      return true;
    }

    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: intervalMs,
      distanceInterval: 15,
      deferredUpdatesInterval: intervalMs,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "EMS Field",
        notificationBody: "Sharing your location while on field duty",
        notificationColor: "#1e3a5f",
      },
    });
    backgroundActive = true;
    return true;
  } catch (err) {
    console.warn("[tracking] background GPS unavailable:", err?.message);
    backgroundActive = false;
    return false;
  }
}

async function startForegroundFallback(token, intervalMs) {
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

  intervalId = setInterval(async () => {
    const services = await Location.hasServicesEnabledAsync();
    if (!services) {
      await sendOrQueue(token, await buildPayload({ gpsDisabled: true }));
      return;
    }
    if (!lastCoords) await readCurrentPosition();
    await sendOrQueue(token, await buildPayload());
  }, intervalMs);
}

export async function startTracking(token, intervalMs = DEFAULT_INTERVAL_MS) {
  await stopTracking();

  const perm = await requestLocationPermission();
  if (!perm.granted) {
    const payload = await buildPayload({ gpsDisabled: true });
    await sendOrQueue(token, payload);
    emit({ gpsDenied: true, pending: await getOutboxCount() });
    return { ok: false, reason: "permission", background: false };
  }

  await readCurrentPosition();
  const first = await buildPayload();
  await sendOrQueue(token, first);

  let usedBackground = false;
  if (perm.background) {
    usedBackground = await startBackgroundUpdates(intervalMs);
  }

  // Always keep a light foreground loop when background isn't available
  // (Expo Go). When background works, still refresh lastCoords in foreground.
  if (!usedBackground) {
    await startForegroundFallback(token, intervalMs);
  } else {
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
  }

  emit({
    running: true,
    gpsDenied: false,
    background: usedBackground,
  });
  return { ok: true, background: usedBackground };
}

export async function stopTracking() {
  await stopForegroundWatch();
  await stopBackgroundUpdates();
  emit({ running: false, background: false });
}

/** Stop GPS and tell EMS this employee is Offline (logout / app exit). */
export async function goOffline(token) {
  await stopTracking();
  if (!token) return;
  try {
    const payload = await buildPayload({ forceOffline: true });
    await pushTracking(token, payload);
  } catch {
    // Best-effort — stale timeout on server covers uninstall/kill
  }
}

export async function flushNow(token) {
  const net = await NetInfo.fetch();
  if (!net.isConnected) return { flushed: 0 };
  return flushOutbox((p) => pushTracking(token, p));
}

export function isBackgroundTrackingActive() {
  return backgroundActive;
}
