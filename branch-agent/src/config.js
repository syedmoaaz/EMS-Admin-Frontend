import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".ems-branch-agent");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

const defaults = {
  apiUrl: "http://localhost:5000/api",
  deviceSecret: "",
  deviceIp: "192.168.1.201",
  devicePort: 4370,
  /** Device poll interval (seconds) — LAN pull into outbox */
  pollIntervalSeconds: 5,
  /** Backend sync interval (seconds) — drain outbox when online */
  syncIntervalSeconds: 3,
  lookbackDays: 7,
  uploadBatchSize: 50,
  deviceMode: "mock", // "mock" | "zk"
  openAtLogin: true,
  /** Keep false until verified on your K50 firmware */
  clearDeviceAfterQueue: false,
};

export const getConfigPath = () => CONFIG_FILE;
export const getConfigDir = () => CONFIG_DIR;

export const loadConfig = () => {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return { ...defaults };
    const raw = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"));
    return { ...defaults, ...raw };
  } catch {
    return { ...defaults };
  }
};

export const saveConfig = (next) => {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const merged = { ...defaults, ...loadConfig(), ...next };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf8");
  return merged;
};
