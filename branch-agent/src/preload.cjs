const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("emsAgent", {
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveConfig: (cfg) => ipcRenderer.invoke("save-config", cfg),
  getState: () => ipcRenderer.invoke("get-state"),
  getConfigPath: () => ipcRenderer.invoke("get-config-path"),
  syncNow: () => ipcRenderer.invoke("sync-now"),
});
