import {
  app,
  BrowserWindow,
  Tray,
  Menu,
  nativeImage,
  ipcMain,
} from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { loadConfig, saveConfig, getConfigPath } from "./config.js";
import {
  startAgentLoop,
  stopAgentLoop,
  getAgentState,
  runSyncCycle,
} from "./sync.js";
import { logger } from "./logger.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HEADLESS =
  process.argv.includes("--headless") ||
  process.argv.includes("--service") ||
  process.env.EMS_AGENT_HEADLESS === "1";

let tray = null;
let settingsWin = null;

const applyLoginItem = (enabled) => {
  try {
    app.setLoginItemSettings({
      openAtLogin: Boolean(enabled),
      openAsHidden: true,
      path: process.execPath,
      args: HEADLESS ? ["--headless"] : [],
    });
  } catch (err) {
    logger.warn("setLoginItemSettings failed", err.message);
  }
};

const createSettingsWindow = () => {
  if (HEADLESS) return;
  if (settingsWin) {
    settingsWin.focus();
    return;
  }

  settingsWin = new BrowserWindow({
    width: 480,
    height: 820,
    resizable: true,
    show: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWin.loadFile(path.join(__dirname, "../renderer/index.html"));
  settingsWin.on("closed", () => {
    settingsWin = null;
  });
};

const updateTrayMenu = () => {
  if (HEADLESS || !tray) return;

  const state = getAgentState();
  const config = loadConfig();
  const label = state.branchName
    ? `Branch: ${state.branchName}`
    : "Branch agent";

  const menu = Menu.buildFromTemplate([
    { label, enabled: false },
    {
      label: state.deviceConnected ? "K50: Connected" : "K50: Disconnected",
      enabled: false,
    },
    {
      label: state.online ? "EMS Server: Online" : "EMS Server: Offline",
      enabled: false,
    },
    {
      label: `Pending upload: ${state.pendingCount ?? 0}`,
      enabled: false,
    },
    {
      label: state.lastSyncAt
        ? `Last upload: ${new Date(state.lastSyncAt).toLocaleString()}`
        : "Not uploaded yet",
      enabled: false,
    },
    {
      label: state.lastError
        ? `Error: ${state.lastError.slice(0, 40)}`
        : "Status: OK",
      enabled: false,
    },
    { type: "separator" },
    {
      label: "Sync now (pull + upload)",
      click: async () => {
        try {
          await runSyncCycle({ catchUp: true });
          updateTrayMenu();
        } catch (err) {
          console.error(err);
          updateTrayMenu();
        }
      },
    },
    {
      label: "Settings",
      click: () => createSettingsWindow(),
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        stopAgentLoop();
        app.quit();
      },
    },
  ]);

  tray.setToolTip(`ADIL AGENCIES Agent — ${config.deviceIp || "no device"}`);
  tray.setContextMenu(menu);
};

const createTrayIcon = () => {
  const candidates = [
    path.join(__dirname, "../renderer/assets/tray-icon.png"),
    path.join(__dirname, "../build/icon.png"),
    path.join(process.resourcesPath || "", "tray-icon.png"),
  ];

  for (const iconPath of candidates) {
    try {
      if (!iconPath) continue;
      const img = nativeImage.createFromPath(iconPath);
      if (!img.isEmpty()) return img.resize({ width: 16, height: 16 });
    } catch {
      // try next
    }
  }

  // Visible fallback (blue square) — empty icons hide the tray entry on Windows
  const pngBase64 =
    "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAALElEQVQ4T2NkYGD4z0ABYBzVMKoBBgYGRvL8/5+BkYGBgRGmAKceUjWAYgAAzFkCAf1cQJwAAAAASUVORK5CYII=";
  return nativeImage.createFromDataURL(`data:image/png;base64,${pngBase64}`);
};

app.whenReady().then(() => {
  const config = loadConfig();
  applyLoginItem(config.openAtLogin);

  if (!HEADLESS) {
    tray = new Tray(createTrayIcon());
    tray.setToolTip("EMS Branch Agent");
    tray.on("double-click", () => createSettingsWindow());
    tray.on("click", () => createSettingsWindow());
    updateTrayMenu();

    try {
      tray.displayBalloon({
        title: "EMS Branch Agent",
        content: "Running in the system tray. Click the icon for Settings.",
      });
    } catch {
      // balloon optional
    }
  }

  ipcMain.handle("get-config", () => loadConfig());
  ipcMain.handle("save-config", (_e, next) => {
    const saved = saveConfig(next);
    applyLoginItem(saved.openAtLogin);
    return saved;
  });
  ipcMain.handle("get-state", () => getAgentState());
  ipcMain.handle("get-config-path", () => getConfigPath());
  ipcMain.handle("sync-now", async () => runSyncCycle({ catchUp: true }));
  ipcMain.handle("get-app-info", () => ({
    packaged: app.isPackaged,
    version: app.getVersion(),
    execPath: process.execPath,
    headless: HEADLESS,
  }));

  if (!HEADLESS && !config.deviceSecret) {
    createSettingsWindow();
  }

  startAgentLoop(() => updateTrayMenu()).catch((err) => {
    logger.error("agent loop failed", err.message || String(err));
    updateTrayMenu();
  });

  if (HEADLESS) {
    logger.info("Running headless / service mode");
  }
});

app.on("window-all-closed", (e) => {
  e.preventDefault();
});

process.on("SIGINT", () => {
  stopAgentLoop();
  app.quit();
});
process.on("SIGTERM", () => {
  stopAgentLoop();
  app.quit();
});
