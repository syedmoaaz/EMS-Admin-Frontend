import AsyncStorage from "@react-native-async-storage/async-storage";

const OUTBOX_KEY = "ems_field_tracking_outbox";
const MAX_POINTS = 500;

export async function loadOutbox() {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  if (!raw) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function saveOutbox(list) {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(list.slice(-MAX_POINTS)));
}

export async function enqueuePoint(point) {
  const list = await loadOutbox();
  list.push({
    ...point,
    queuedAt: Date.now(),
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  });
  await saveOutbox(list);
  return list.length;
}

export async function flushOutbox(sendFn) {
  const list = await loadOutbox();
  if (!list.length) return { flushed: 0, remaining: 0 };

  const remaining = [];
  let flushed = 0;
  let failed = false;

  for (const point of list) {
    if (failed) {
      remaining.push(point);
      continue;
    }
    try {
      const { id: _id, queuedAt: _q, ...payload } = point;
      await sendFn(payload);
      flushed += 1;
    } catch {
      remaining.push(point);
      failed = true;
    }
  }

  await saveOutbox(remaining);
  return { flushed, remaining: remaining.length };
}

export async function getOutboxCount() {
  const list = await loadOutbox();
  return list.length;
}
