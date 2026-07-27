import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { companyWallTimeOnDay } from "./scheduleTime";

const IDS_KEY = "ems_checkout_reminder_ids";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const parseClock = (clock = "06:00 PM") => {
  const match = String(clock)
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return { hours: 18, minutes: 0 };
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && hours !== 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  return { hours, minutes };
};

export async function ensureNotificationPermission() {
  if (Platform.OS === "web") return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === "granted") return true;
  const asked = await Notifications.requestPermissionsAsync();
  return Boolean(asked.granted || asked.status === "granted");
}

async function saveIds(ids) {
  await AsyncStorage.setItem(IDS_KEY, JSON.stringify(ids));
}

async function loadIds() {
  try {
    const raw = await AsyncStorage.getItem(IDS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function cancelCheckoutReminders() {
  const ids = await loadIds();
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ignore
    }
  }
  await AsyncStorage.removeItem(IDS_KEY);
}

/**
 * Schedule local "please check out" reminders starting at shiftEnd + offset,
 * every interval minutes, until 23:45 local (before midnight auto-close).
 */
export async function scheduleCheckoutReminders({
  shiftEnd = "06:00 PM",
  offsetMinutes = 15,
  intervalMinutes = 15,
  dayDate = new Date(),
} = {}) {
  await cancelCheckoutReminders();

  const ok = await ensureNotificationPermission();
  if (!ok) return { scheduled: 0, reason: "permission" };

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("checkout-reminders", {
      name: "Checkout reminders",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { hours, minutes } = parseClock(shiftEnd);
  const shiftEndAt = companyWallTimeOnDay(dayDate, hours, minutes);
  let firstAt = new Date(shiftEndAt.getTime() + offsetMinutes * 60_000);

  const lastAllowed = companyWallTimeOnDay(dayDate, 23, 45);
  const now = Date.now();

  // If already past first reminder, start at next interval slot after now
  if (firstAt.getTime() <= now) {
    const elapsed = now - shiftEndAt.getTime();
    if (elapsed < offsetMinutes * 60_000) {
      firstAt = new Date(shiftEndAt.getTime() + offsetMinutes * 60_000);
    } else {
      const afterOffset = elapsed - offsetMinutes * 60_000;
      const steps = Math.floor(afterOffset / (intervalMinutes * 60_000)) + 1;
      firstAt = new Date(
        shiftEndAt.getTime() +
          offsetMinutes * 60_000 +
          steps * intervalMinutes * 60_000
      );
    }
  }

  const ids = [];
  let at = firstAt;
  const stepMs = intervalMinutes * 60_000;

  while (at.getTime() <= lastAllowed.getTime() && at.getTime() > now) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "EMS Field — Check out",
        body: "Please check out if you have completed your shift.",
        sound: true,
        ...(Platform.OS === "android"
          ? { channelId: "checkout-reminders" }
          : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: at,
      },
    });
    ids.push(id);
    at = new Date(at.getTime() + stepMs);
    if (ids.length >= 40) break;
  }

  await saveIds(ids);
  return { scheduled: ids.length };
}
