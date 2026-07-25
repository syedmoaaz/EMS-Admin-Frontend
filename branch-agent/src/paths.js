import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENT_ROOT = path.resolve(__dirname, "..");

/**
 * Writable base for config/outbox/logs.
 * Always under the user profile so Program Files installs work.
 */
export const getBaseDir = () => {
  if (process.env.EMS_AGENT_DATA) {
    return path.resolve(process.env.EMS_AGENT_DATA);
  }
  return path.join(os.homedir(), ".ems-branch-agent");
};

export const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
};

export const dataDir = () => {
  const dir = path.join(getBaseDir(), "data");
  ensureDir(dir);
  return dir;
};

export const logsDir = () => {
  const dir = path.join(getBaseDir(), "logs");
  ensureDir(dir);
  return dir;
};

/** Same folder as data — config.json lives here */
export const homeConfigDir = () => {
  const dir = getBaseDir();
  ensureDir(dir);
  return dir;
};

/** Project root (source / unpacked resources) — not for writable data */
export const getAgentRoot = () => AGENT_ROOT;
