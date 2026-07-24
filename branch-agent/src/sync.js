import { loadConfig } from "./config.js";
import * as api from "./api.js";
import * as mockAdapter from "./device/mockAdapter.js";
import * as zkAdapter from "./device/zkAdapter.js";
import { isAfterCheckpoint } from "./device/punchHelpers.js";
import * as outbox from "./outbox.js";
import { logger } from "./logger.js";

const state = {
  running: false,
  lastSyncAt: null,
  lastPullAt: null,
  lastError: "",
  branchName: "",
  companyName: "",
  pendingCount: 0,
  lastEnqueued: 0,
  lastUploaded: 0,
  /** EMS backend / internet reachable */
  online: false,
  /** K50 reachable on LAN (last successful poll) */
  deviceConnected: false,
  deviceLastError: "",
  pollTimer: null,
  syncTimer: null,
  pollBusy: false,
  syncBusy: false,
};

const BASE_BACKOFF_MS = 2000;
const MAX_BACKOFF_MS = 60000;
let backoffMs = BASE_BACKOFF_MS;
let nextUploadAllowedAt = 0;

export const getAgentState = () => {
  const stats = outbox.getOutboxStats();
  return {
    ...state,
    pendingCount: stats.pending,
    outbox: stats,
    pollTimer: undefined,
    syncTimer: undefined,
  };
};

/**
 * Phase A — pull device over LAN → durable outbox.
 * First install: skip historical logs (checkpoint only), like advanced agent.
 * Later: enqueue only punches after checkpoint (with serial wrap awareness).
 */
export async function pullAndEnqueue() {
  const config = loadConfig();
  if (!config.deviceIp && config.deviceMode === "zk") {
    state.deviceConnected = false;
    state.deviceLastError = "Device IP is not configured";
    throw new Error("Device IP is not configured");
  }

  let rawLogs = [];
  let mapped = [];

  if (config.deviceMode === "zk") {
    const { ok, logs, error } = await zkAdapter.fetchAttendances({
      deviceIp: config.deviceIp,
      devicePort: config.devicePort,
    });
    if (!ok) {
      state.deviceConnected = false;
      state.deviceLastError = error || "Device not connected";
      outbox.bumpReconnect();
      throw new Error(error || "Device not connected");
    }
    state.deviceConnected = true;
    state.deviceLastError = "";
    rawLogs = logs;
    mapped = zkAdapter.mapDeviceLogs(logs);
  } else {
    // Mock mode: treat as "connected" so UI can be exercised offline
    state.deviceConnected = true;
    state.deviceLastError = "";
    const fromEnv = mockAdapter.punchesFromEnv();
    mapped = fromEnv.length
      ? fromEnv.map((p) => ({
          ...p,
          devicePin: p.devicePin || p.employeeId,
          serialNo: p.serialNo ?? null,
          userSn: p.serialNo ?? null,
          recordTime: p.punchedAt,
        }))
      : await mockAdapter.fetchPunches(config);
  }

  let st = outbox.loadState();

  // First install: skip existing history, save checkpoint only
  if (!st.initialized) {
    if (rawLogs.length || mapped.length) {
      const sorted = mapped.length
        ? [...mapped].sort((a, b) =>
            String(a.punchedAt).localeCompare(String(b.punchedAt))
          )
        : [];
      const last = sorted[sorted.length - 1];
      st = outbox.markInitialized(
        st,
        last?.serialNo ?? last?.userSn ?? null,
        last?.punchedAt || last?.recordTime || null
      );
    } else {
      st = outbox.markInitialized(st, null, null);
    }
    state.lastPullAt = new Date().toISOString();
    state.pendingCount = outbox.getPendingCount();
    return { pulled: mapped.length, added: 0, pending: state.pendingCount, skippedHistory: true };
  }

  const candidates = mapped.filter((log) =>
    isAfterCheckpoint(
      { userSn: log.serialNo ?? log.userSn, recordTime: log.punchedAt },
      st.lastQueuedSerial,
      st.lastQueuedTime
    )
  );

  const result = outbox.enqueuePunches(candidates, st);

  if (config.clearDeviceAfterQueue && result.added > 0 && config.deviceMode === "zk") {
    await zkAdapter.clearAttendanceLog({
      deviceIp: config.deviceIp,
      devicePort: config.devicePort,
    });
  }

  state.lastPullAt = new Date().toISOString();
  state.lastEnqueued = result.added;
  state.pendingCount = result.pending;

  return {
    pulled: mapped.length,
    added: result.added,
    pending: result.pending,
    skippedHistory: false,
  };
}

/**
 * Phase B — drain outbox to EMS when online (independent of poll).
 */
export async function uploadPending() {
  const config = loadConfig();

  if (!config.deviceSecret) {
    throw new Error("Device secret is not configured");
  }
  if (!config.apiUrl) {
    throw new Error("API URL is not configured");
  }

  if (Date.now() < nextUploadAllowedAt) {
    return {
      skipped: true,
      reason: "backoff",
      pending: outbox.getPendingCount(),
    };
  }

  const online = await api.isOnline(config.apiUrl);
  state.online = online;
  if (!online) {
    state.lastError = "Offline — punches kept in local outbox";
    return { skipped: true, reason: "offline", pending: outbox.getPendingCount() };
  }

  try {
    const me = await api.deviceMe(config.apiUrl, config.deviceSecret);
    state.branchName = me.branchName || "";
    state.companyName = me.companyName || "";
  } catch (err) {
    state.lastError = err.message;
    nextUploadAllowedAt = Date.now() + backoffMs;
    backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
    throw err;
  }

  const batchSize = Math.max(1, Number(config.uploadBatchSize) || 50);
  const pending = outbox.getPendingRecords().slice(0, batchSize);

  if (!pending.length) {
    backoffMs = BASE_BACKOFF_MS;
    nextUploadAllowedAt = 0;
    try {
      await api.heartbeat(config.apiUrl, config.deviceSecret, {
        deviceIp: config.deviceIp,
        devicePort: config.devicePort,
        agentVersion: "1.2.0",
        pendingCount: 0,
        lastError: "",
      });
    } catch {
      /* optional */
    }
    state.lastError = "";
    state.lastSyncAt = new Date().toISOString();
    outbox.markSuccessfulSync();
    return { skipped: false, summary: null, uploaded: 0, pending: 0 };
  }

  const punches = pending.map((r) => ({
    employeeId: r.devicePin,
    devicePin: r.devicePin,
    punchedAt: r.punchedAt,
    date: r.date,
  }));

  try {
    logger.info(`Sending attendance batch: ${punches.length}`);
    const summary = await api.ingestAttendance(
      config.apiUrl,
      config.deviceSecret,
      punches
    );

    outbox.updateRecords(
      pending.map((r) => ({ id: r.id, status: "sent", lastError: null }))
    );

    backoffMs = BASE_BACKOFF_MS;
    nextUploadAllowedAt = 0;
    state.lastUploaded = pending.length;
    state.pendingCount = outbox.getPendingCount();
    state.lastSyncAt = new Date().toISOString();
    state.lastError = "";

    await api.heartbeat(config.apiUrl, config.deviceSecret, {
      deviceIp: config.deviceIp,
      devicePort: config.devicePort,
      agentVersion: "1.2.0",
      pendingCount: state.pendingCount,
      lastError: "",
    });

    logger.info("Attendance sent", { uploaded: pending.length, pending: state.pendingCount });

    return {
      skipped: false,
      summary,
      uploaded: pending.length,
      pending: state.pendingCount,
    };
  } catch (err) {
    const retryable = err.retryable !== false;
    outbox.updateRecords(
      pending.map((r) => ({
        id: r.id,
        status: retryable ? "pending" : "failed",
        lastError: err.message,
      }))
    );

    state.lastError = err.message;
    state.pendingCount = outbox.getPendingCount();

    if (retryable) {
      nextUploadAllowedAt = Date.now() + backoffMs;
      logger.warn(`Sync backoff ${backoffMs}ms`);
      backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
    }

    try {
      await api.heartbeat(config.apiUrl, config.deviceSecret, {
        deviceIp: config.deviceIp,
        devicePort: config.devicePort,
        agentVersion: "1.2.0",
        pendingCount: state.pendingCount,
        lastError: err.message,
      });
    } catch {
      /* ignore */
    }

    throw err;
  }
}

/** Manual / catch-up: one poll + one upload */
export async function runSyncCycle({ catchUp = false } = {}) {
  let pullResult = { pulled: 0, added: 0, pending: 0 };
  let uploadResult = { uploaded: 0, pending: 0, summary: null };

  try {
    pullResult = await pullAndEnqueue();
    if (catchUp) {
      logger.info("Catch-up pull", pullResult);
    }
  } catch (err) {
    outbox.bumpReconnect();
    state.deviceConnected = false;
    state.deviceLastError = err.message;
    state.lastError = `Device pull failed: ${err.message}`;
    logger.error("pull", err.message);
  }

  try {
    uploadResult = await uploadPending();
    if (uploadResult.skipped && uploadResult.reason === "offline") {
      logger.warn("Offline — outbox holding punches", {
        pending: uploadResult.pending,
      });
    }
  } catch (err) {
    logger.error("upload", err.message);
  }

  const stats = outbox.getOutboxStats();
  state.pendingCount = stats.pending;

  return {
    me: {
      branchName: state.branchName,
      companyName: state.companyName,
    },
    pull: pullResult,
    upload: uploadResult,
    summary: uploadResult.summary || {
      received: 0,
      inserted: 0,
      duplicates: 0,
      derived: 0,
    },
    punches: pullResult.pulled,
    pending: stats.pending,
    online: state.online,
  };
}

export async function startAgentLoop(onUpdate) {
  if (state.running) return;
  state.running = true;

  const notify = (result) => onUpdate?.(getAgentState(), result);

  const pollOnce = async () => {
    if (state.pollBusy || !state.running) return;
    state.pollBusy = true;
    try {
      const pull = await pullAndEnqueue();
      state.pendingCount = pull.pending;
      notify({ pull, upload: null, punches: pull.pulled, pending: pull.pending, online: state.online });
    } catch (err) {
      state.deviceConnected = false;
      state.deviceLastError = err.message;
      state.lastError = err.message;
      logger.error("Poll cycle error", err.message);
      notify(null);
    } finally {
      state.pollBusy = false;
    }
  };

  const syncOnce = async () => {
    if (state.syncBusy || !state.running) return;
    state.syncBusy = true;
    try {
      const upload = await uploadPending();
      state.pendingCount = upload.pending ?? outbox.getPendingCount();
      notify({
        pull: null,
        upload,
        punches: 0,
        pending: state.pendingCount,
        online: state.online,
        me: { branchName: state.branchName, companyName: state.companyName },
        summary: upload.summary,
      });
    } catch (err) {
      state.lastError = err.message;
      logger.error("Sync cycle error", err.message);
      notify(null);
    } finally {
      state.syncBusy = false;
    }
  };

  // Startup catch-up
  await pollOnce();
  await syncOnce();

  const schedulePoll = () => {
    if (!state.running) return;
    const config = loadConfig();
    const pending = outbox.getPendingCount();
    const base = Math.max(2, Number(config.pollIntervalSeconds) || 5) * 1000;
    const ms = pending > 0 ? Math.min(base, 5000) : base;
    state.pollTimer = setTimeout(async () => {
      await pollOnce();
      schedulePoll();
    }, ms);
  };

  const scheduleSync = () => {
    if (!state.running) return;
    const config = loadConfig();
    const ms = Math.max(2, Number(config.syncIntervalSeconds) || 3) * 1000;
    state.syncTimer = setTimeout(async () => {
      await syncOnce();
      scheduleSync();
    }, ms);
  };

  schedulePoll();
  scheduleSync();

  setInterval(() => {
    logger.info("Heartbeat", {
      pending: outbox.getPendingCount(),
      online: state.online,
      branch: state.branchName,
      lastSuccessfulSync: outbox.loadState().lastSuccessfulSync,
      stats: outbox.loadState().stats,
    });
  }, 300000);

  logger.info("Agent running (poll + sync loops active)");
}

export function stopAgentLoop() {
  state.running = false;
  if (state.pollTimer) clearTimeout(state.pollTimer);
  if (state.syncTimer) clearTimeout(state.syncTimer);
  state.pollTimer = null;
  state.syncTimer = null;
}
