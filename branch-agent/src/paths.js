import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AGENT_ROOT = path.resolve(__dirname, "..");

/** Prefer project-local data/ next to agent (like advanced agent); fall back to home. */
export const getBaseDir = () => {
  if (process.pkg) return path.dirname(process.execPath);
  return AGENT_ROOT;
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

/** Legacy home config still used for Electron settings compatibility. */
export const homeConfigDir = () => {
  const dir = path.join(os.homedir(), ".ems-branch-agent");
  ensureDir(dir);
  return dir;
};
