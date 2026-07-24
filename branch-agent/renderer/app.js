function setIndicator(dotId, textId, cardId, ok, okText, badText, hintId, hintOk, hintBad) {
  const dot = document.getElementById(dotId);
  const text = document.getElementById(textId);
  const card = document.getElementById(cardId);
  const hint = hintId ? document.getElementById(hintId) : null;

  dot.classList.toggle("ok", ok);
  dot.classList.toggle("bad", !ok);
  card.classList.toggle("ok", ok);
  card.classList.toggle("bad", !ok);
  text.textContent = ok ? okText : badText;
  if (hint) hint.textContent = ok ? hintOk : hintBad;
}

async function fill() {
  const cfg = await window.emsAgent.getConfig();
  const state = await window.emsAgent.getState();
  const path = await window.emsAgent.getConfigPath();

  document.getElementById("apiUrl").value = cfg.apiUrl || "";
  document.getElementById("deviceSecret").value = cfg.deviceSecret || "";
  document.getElementById("deviceIp").value = cfg.deviceIp || "";
  document.getElementById("devicePort").value = cfg.devicePort || 4370;
  document.getElementById("pollIntervalSeconds").value =
    cfg.pollIntervalSeconds || 5;
  document.getElementById("syncIntervalSeconds").value =
    cfg.syncIntervalSeconds || 3;
  document.getElementById("deviceMode").value = cfg.deviceMode || "mock";
  document.getElementById("openAtLogin").checked = Boolean(cfg.openAtLogin);
  document.getElementById("path").textContent = `Config file: ${path}`;

  document.getElementById("pendingCount").textContent = String(
    state.pendingCount ?? state.outbox?.pending ?? 0
  );

  const deviceOk = Boolean(state.deviceConnected);
  setIndicator(
    "deviceDot",
    "deviceStatus",
    "deviceCard",
    deviceOk,
    "Connected",
    "Disconnected",
    "deviceHint",
    cfg.deviceMode === "mock"
      ? "Mock mode — treated as connected"
      : `Reachable at ${cfg.deviceIp || "—"}:${cfg.devicePort || 4370}`,
    state.deviceLastError || "Cannot reach K50 on LAN"
  );

  const serverOk = Boolean(state.online);
  setIndicator(
    "serverDot",
    "onlineStatus",
    "serverCard",
    serverOk,
    "Online",
    "Offline",
    "serverHint",
    "EMS API reachable — uploads OK",
    "No internet / API down — punches stay in outbox"
  );

  const status = document.getElementById("status");
  const parts = [];
  if (state.branchName) parts.push(`Bound to ${state.branchName}`);
  if (state.outbox?.initialized === false) {
    parts.push("first install — history skipped on next poll");
  }
  if (state.lastSyncAt) {
    parts.push(`last upload ${new Date(state.lastSyncAt).toLocaleString()}`);
  }
  if (state.lastPullAt) {
    parts.push(`last pull ${new Date(state.lastPullAt).toLocaleString()}`);
  }
  if (state.lastError) parts.push(state.lastError);
  status.textContent = parts.join(" · ") || "Idle";
}

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const next = {
    apiUrl: document.getElementById("apiUrl").value.trim().replace(/\/$/, ""),
    deviceSecret: document.getElementById("deviceSecret").value.trim(),
    deviceIp: document.getElementById("deviceIp").value.trim(),
    devicePort: Number(document.getElementById("devicePort").value) || 4370,
    pollIntervalSeconds:
      Number(document.getElementById("pollIntervalSeconds").value) || 5,
    syncIntervalSeconds:
      Number(document.getElementById("syncIntervalSeconds").value) || 3,
    deviceMode: document.getElementById("deviceMode").value,
    openAtLogin: document.getElementById("openAtLogin").checked,
  };

  await window.emsAgent.saveConfig(next);
  document.getElementById("status").textContent =
    "Saved. Restart agent or click Sync now.";
});

document.getElementById("syncBtn").addEventListener("click", async () => {
  const status = document.getElementById("status");
  status.textContent = "Syncing (pull → outbox → upload)…";
  try {
    await window.emsAgent.syncNow();
    await fill();
  } catch (err) {
    status.textContent = err.message || "Sync failed";
    await fill();
  }
});

fill();
setInterval(fill, 3000);
