async function fill() {
  const cfg = await window.emsAgent.getConfig();
  const state = await window.emsAgent.getState();
  const path = await window.emsAgent.getConfigPath();

  document.getElementById("apiUrl").value = cfg.apiUrl || "";
  document.getElementById("deviceSecret").value = cfg.deviceSecret || "";
  document.getElementById("deviceIp").value = cfg.deviceIp || "";
  document.getElementById("devicePort").value = cfg.devicePort || 4370;
  document.getElementById("pollIntervalSeconds").value =
    cfg.pollIntervalSeconds || 45;
  document.getElementById("deviceMode").value = cfg.deviceMode || "mock";
  document.getElementById("openAtLogin").checked = Boolean(cfg.openAtLogin);
  document.getElementById("path").textContent = `Config file: ${path}`;

  const status = document.getElementById("status");
  if (state.branchName) {
    status.textContent = `Bound to ${state.branchName}${
      state.lastSyncAt
        ? ` · last sync ${new Date(state.lastSyncAt).toLocaleString()}`
        : ""
    }`;
  } else if (state.lastError) {
    status.textContent = state.lastError;
  }
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const next = {
    apiUrl: document.getElementById("apiUrl").value.trim().replace(/\/$/, ""),
    deviceSecret: document.getElementById("deviceSecret").value.trim(),
    deviceIp: document.getElementById("deviceIp").value.trim(),
    devicePort: Number(document.getElementById("devicePort").value) || 4370,
    pollIntervalSeconds:
      Number(document.getElementById("pollIntervalSeconds").value) || 45,
    deviceMode: document.getElementById("deviceMode").value,
    openAtLogin: document.getElementById("openAtLogin").checked,
  };

  await window.emsAgent.saveConfig(next);
  document.getElementById("status").textContent =
    "Saved. Restart agent or click Sync now.";
});

document.getElementById("syncBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Syncing…";
  try {
    const result = await window.emsAgent.syncNow();
    status.textContent = `Synced ${result.punches} punch(es) · ${result.me?.branchName || ""}`;
  } catch (err) {
    status.textContent = err.message || "Sync failed";
  }
});

fill();
