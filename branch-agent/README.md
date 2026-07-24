# ADIL AGENCIES Branch Agent

Windows agent for Module 1: pulls biometric punches from a branch ZKTeco K50 (LAN / same network) and uploads them to EMS using that branch’s **device secret** only.

Reliability patterns adapted from [ZKTECO-ADVANCED-CURSOR-AGENT](https://github.com/syedmoaaz/ZKTECO-ADVANCED-CURSOR-AGENT.git) (Gymfinity ZK agent).

## Offline reliability (priority)

```text
Device (LAN) → poll → local outbox → retry POST → EMS backend
```

1. Poll `getAttendances()` over LAN (works if internet/Wi‑Fi uplink is down, as long as the PC reaches the device).
2. Enqueue new punches into `data/queue.jsonl` and advance checkpoint in `data/state.json`.
3. Sync pending rows to EMS `/device/attendance/ingest` when online.
4. Mark `sent` only after HTTP success. Failures stay `pending` and retry with exponential backoff.

### First install vs restart

- **No `data/state.json` / not initialized:** skip existing device history once, then save checkpoint (avoids flooding old logs).
- **After that:** punches that happened while the PC/agent was off are pulled from the device and queued on the next poll.

### Backend idempotency

EMS dedupes on `(branch + devicePin + punchedAt)`. Safe to retry after crashes.

## Employee IDs vs K50 PINs

| Field | Example | Where |
|--------|---------|--------|
| **Employee ID** | `THT-1` | EMS only |
| **Device PIN** | `11`, `101` | K50 User ID — digits, **no leading zero** |

## Setup

```bash
cd branch-agent
npm install
npm install node-zklib
```

Configure via Electron Settings or:

```bash
node -e "import('./src/config.js').then(m => m.saveConfig({ apiUrl: 'https://YOUR-RAILWAY-URL/api', deviceSecret: 'ems_dev_xxx', deviceIp: '192.168.1.201', deviceMode: 'zk' }))"
```

Run:

- Electron tray: `npm start`
- Headless: `npm run sync`
- Crash-restart wrapper: `run-agent.bat` (put in Windows Startup)

Mock test:

```powershell
$env:EMS_MOCK_PUNCHES='[{"employeeId":"11","punchedAt":"2026-07-24T09:05:00.000Z","serialNo":1}]'
npm run sync -- --once
```

## Config

| Key | Default | Meaning |
|-----|---------|---------|
| `pollIntervalSeconds` | `5` | Device poll interval |
| `syncIntervalSeconds` | `3` | Outbox upload interval |
| `uploadBatchSize` | `50` | Max punches per ingest |
| `clearDeviceAfterQueue` | `false` | Only enable after testing firmware |
| `deviceMode` | `mock` \| `zk` | Mock vs real K50 |

Settings UI config file: `~/.ems-branch-agent/config.json`  
Outbox + state: `branch-agent/data/`  
Logs: `branch-agent/logs/agent.log`

## Hard limit

If the device attendance memory fills and overwrites punches **before** the agent has queued them locally, those punches are lost at the hardware layer. Keep the agent always running on the branch PC.
