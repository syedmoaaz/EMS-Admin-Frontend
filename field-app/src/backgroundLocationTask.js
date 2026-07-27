/**
 * Must be imported at app startup (before App) so the task is registered
 * when Android wakes the JS runtime for background location.
 */
import * as TaskManager from "expo-task-manager";
import * as Battery from "expo-battery";
import NetInfo from "@react-native-community/netinfo";
import { getToken, pushTracking } from "./auth";
import { enqueuePoint, flushOutbox } from "./outbox";

export const BACKGROUND_LOCATION_TASK = "EMS_FIELD_BACKGROUND_LOCATION";

async function batteryLabel() {
  try {
    const level = await Battery.getBatteryLevelAsync();
    if (level == null || level < 0) return "--";
    return `${Math.round(level * 100)}%`;
  } catch {
    return "--";
  }
}

TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.warn("[bg-location]", error.message);
    return;
  }

  const locations = data?.locations;
  if (!locations?.length) return;

  const coords = locations[locations.length - 1]?.coords;
  if (!coords) return;

  const token = await getToken();
  if (!token) return;

  const net = await NetInfo.fetch();
  const speed =
    coords.speed != null && coords.speed >= 0 ? Math.max(0, coords.speed) : 0;
  const payload = {
    lat: coords.latitude,
    lng: coords.longitude,
    speed: String(speed.toFixed(1)),
    battery: await batteryLabel(),
    location: "--",
    online: Boolean(net.isConnected),
    gpsDisabled: false,
    status: speed > 0.5 ? "Moving" : "Stationary",
  };

  try {
    if (!net.isConnected) {
      await enqueuePoint(payload);
      return;
    }
    await pushTracking(token, payload);
    await flushOutbox((p) => pushTracking(token, p));
  } catch (err) {
    try {
      await enqueuePoint(payload);
    } catch {
      console.warn("[bg-location] queue failed", err?.message);
    }
  }
});
