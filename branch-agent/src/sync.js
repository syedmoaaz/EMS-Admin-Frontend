import { loadConfig } from "./config.js";
import * as api from "./api.js";
import * as mockAdapter from "./device/mockAdapter.js";
import * as zkAdapter from "./device/zkAdapter.js";

const state = {
  running: false,
  lastSyncAt: null,
  lastError: "",
  branchName: "",
  companyName: "",
  timer: null,
};

export const getAgentState = () => ({ ...state, timer: undefined });

async function pullToday(config) {
  if (config.deviceMode === "zk") {
    return zkAdapter.fetchPunchesForToday({
      deviceIp: config.deviceIp,
      devicePort: config.devicePort,
    });
  }

  const fromEnv = mockAdapter.punchesFromEnv();
  if (fromEnv.length) return fromEnv;
  return mockAdapter.fetchPunchesForToday({
    deviceIp: config.deviceIp,
    devicePort: config.devicePort,
  });
}

/**
 * Startup catch-up + optional continuous poll.
 * Always pulls current calendar day attendance from device first.
 */
export async function runSyncCycle({ catchUp = false } = {}) {
  const config = loadConfig();

  if (!config.deviceSecret) {
    throw new Error("Device secret is not configured");
  }
  if (!config.apiUrl) {
    throw new Error("API URL is not configured");
  }

  const me = await api.deviceMe(config.apiUrl, config.deviceSecret);
  state.branchName = me.branchName || "";
  state.companyName = me.companyName || "";

  const punches = await pullToday(config);

  if (catchUp) {
    console.log(
      `[agent] Catch-up for ${state.branchName}: ${punches.length} punch(es) today`
    );
  }

  let summary = { received: 0, inserted: 0, duplicates: 0, derived: 0 };

  if (punches.length) {
    summary = await api.ingestAttendance(
      config.apiUrl,
      config.deviceSecret,
      punches
    );
  }

  await api.heartbeat(config.apiUrl, config.deviceSecret, {
    deviceIp: config.deviceIp,
    devicePort: config.devicePort,
    agentVersion: "1.0.0",
    lastError: "",
  });

  state.lastSyncAt = new Date().toISOString();
  state.lastError = "";

  return { me, summary, punches: punches.length };
}

export async function startAgentLoop(onUpdate) {
  if (state.running) return;
  state.running = true;

  const tick = async (catchUp) => {
    try {
      const result = await runSyncCycle({ catchUp });
      onUpdate?.(getAgentState(), result);
    } catch (err) {
      state.lastError = err.message;
      const config = loadConfig();
      try {
        if (config.deviceSecret && config.apiUrl) {
          await api.heartbeat(config.apiUrl, config.deviceSecret, {
            deviceIp: config.deviceIp,
            devicePort: config.devicePort,
            agentVersion: "1.0.0",
            lastError: err.message,
          });
        }
      } catch {
        /* ignore */
      }
      onUpdate?.(getAgentState(), null);
      console.error("[agent]", err.message);
    }
  };

  // Late-boot catch-up: pull all of today's records first
  await tick(true);

  const config = loadConfig();
  const ms = Math.max(15, Number(config.pollIntervalSeconds) || 45) * 1000;
  state.timer = setInterval(() => tick(false), ms);
}

export function stopAgentLoop() {
  state.running = false;
  if (state.timer) clearInterval(state.timer);
  state.timer = null;
}
