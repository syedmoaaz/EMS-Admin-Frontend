import fs from "fs";
import path from "path";
import { logsDir } from "./paths.js";

const MAX_LOG_BYTES = 5 * 1024 * 1024;

const stamp = () => new Date().toISOString();

const rotateIfNeeded = (filePath) => {
  try {
    if (!fs.existsSync(filePath)) return;
    const stat = fs.statSync(filePath);
    if (stat.size < MAX_LOG_BYTES) return;
    fs.renameSync(filePath, `${filePath}.${Date.now()}.bak`);
  } catch {
    /* ignore */
  }
};

const writeLine = (level, message, meta) => {
  const line =
    meta !== undefined
      ? `[${stamp()}] [${level}] ${message} ${
          typeof meta === "string" ? meta : JSON.stringify(meta)
        }`
      : `[${stamp()}] [${level}] ${message}`;

  console.log(line);

  try {
    const filePath = path.join(logsDir(), "agent.log");
    rotateIfNeeded(filePath);
    fs.appendFileSync(filePath, `${line}\n`, "utf8");
  } catch {
    /* console already printed */
  }
};

export const logger = {
  info: (msg, meta) => writeLine("INFO", msg, meta),
  warn: (msg, meta) => writeLine("WARN", msg, meta),
  error: (msg, meta) => writeLine("ERROR", msg, meta),
  debug: (msg, meta) => writeLine("DEBUG", msg, meta),
};
