import fs from "fs";
import path from "path";
import { homeConfigDir } from "./paths.js";

const defaults = {
  apiUrl: "https://ems-backend-production-9972.up.railway.app/api",
  deviceSecret: "",
  deviceIp: "192.168.1.201",
  devicePort: 4370,
  pollIntervalSeconds: 5,
  syncIntervalSeconds: 3,
  lookbackDays: 7,
  uploadBatchSize: 50,
  deviceMode: "zk",
  openAtLogin: true,
  clearDeviceAfterQueue: false,
};

export const getConfigDir = () => homeConfigDir();
export const getConfigPath = () => path.join(getConfigDir(), "config.json");

export const loadConfig = () => {
  try {
    const file = getConfigPath();
    if (!fs.existsSync(file)) return { ...defaults };
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    return { ...defaults, ...raw };
  } catch {
    return { ...defaults };
  }
};

export const saveConfig = (next) => {
  const dir = getConfigDir();
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const merged = { ...defaults, ...loadConfig(), ...next };
  fs.writeFileSync(getConfigPath(), JSON.stringify(merged, null, 2), "utf8");
  return merged;
};
