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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let tray = null;
let settingsWin = null;

const createSettingsWindow = () => {
  if (settingsWin) {
    settingsWin.focus();
    return;
  }

  settingsWin = new BrowserWindow({
    width: 480,
    height: 780,
    resizable: false,
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

  tray?.setToolTip(
    `ADIL AGENCIES Agent — ${config.deviceIp || "no device"}`
  );
  tray?.setContextMenu(menu);
};

app.whenReady().then(() => {
  const config = loadConfig();
  if (config.openAtLogin) {
    app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });
  }

  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  updateTrayMenu();

  ipcMain.handle("get-config", () => loadConfig());
  ipcMain.handle("save-config", (_e, next) => {
    const saved = saveConfig(next);
    if (saved.openAtLogin) {
      app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });
    }
    return saved;
  });
  ipcMain.handle("get-state", () => getAgentState());
  ipcMain.handle("get-config-path", () => getConfigPath());
  ipcMain.handle("sync-now", async () => runSyncCycle({ catchUp: true }));

  if (!config.deviceSecret) {
    createSettingsWindow();
  }

  startAgentLoop(() => updateTrayMenu()).catch(() => updateTrayMenu());
});

app.on("window-all-closed", (e) => {
  e.preventDefault();
});
