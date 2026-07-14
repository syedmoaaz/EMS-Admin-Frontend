import { loadConfig, saveConfig, getConfigPath } from "./config.js";
import { runSyncCycle, startAgentLoop, stopAgentLoop } from "./sync.js";

const once = process.argv.includes("--once");

console.log("EMS Branch Agent");
console.log("Config:", getConfigPath());

const config = loadConfig();
if (!config.deviceSecret) {
  console.log(`
Missing device secret. Save config first, e.g.:

  node -e "import('./src/config.js').then(m => m.saveConfig({ apiUrl: 'http://localhost:5000/api', deviceSecret: 'ems_dev_xxx', deviceIp: '192.168.1.201', deviceMode: 'mock' }))"

Then re-run: npm run sync
`);
  process.exit(1);
}

if (once) {
  runSyncCycle({ catchUp: true })
    .then((result) => {
      console.log("Sync OK:", JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((err) => {
      console.error("Sync failed:", err.message);
      process.exit(1);
    });
} else {
  startAgentLoop((state, result) => {
    if (result) {
      console.log(
        `[${new Date().toLocaleTimeString()}] ${state.branchName} sync`,
        result.summary
      );
    } else if (state.lastError) {
      console.log(`[${new Date().toLocaleTimeString()}] error: ${state.lastError}`);
    }
  });

  process.on("SIGINT", () => {
    stopAgentLoop();
    process.exit(0);
  });
}

export { saveConfig, loadConfig };
