# MediTrack Branch Agent

Windows agent for Module 1: pulls biometric punches from a branch ZKTeco K50 (LAN) and uploads them to EMS using that branch’s **device secret** only.

## Setup

1. In EMS Admin → **Branches** → edit a branch → **Generate secret** → copy once.
2. On the branch PC:

```bash
cd branch-agent
npm install
```

3. Configure (CLI) or run Electron and use Settings:

```bash
node -e "import('./src/config.js').then(m => m.saveConfig({ apiUrl: 'http://YOUR_SERVER:5000/api', deviceSecret: 'ems_dev_xxx', deviceIp: '192.168.1.201', deviceMode: 'mock' }))"
```

4. Test without a device (`deviceMode: mock`) using fake punches:

```powershell
$env:EMS_MOCK_PUNCHES='[{"employeeId":"EMP-0001","punchedAt":"2026-07-14T09:05:00.000Z"}]'
npm run sync -- --once
```

5. With a real K50 on LAN:

- Set `deviceMode` to `zk`
- Install ZK client: `npm install zklib`
- Ensure Employee ID in EMS matches the machine User ID
- `npm start` (Electron tray) or `npm run sync` (headless loop)

## Isolation

Every request sends `X-Device-Secret`. Backend stamps `company` + `branch` from that secret only — branch A’s secret cannot write branch B attendance.

## Late boot

On start the agent always **catch-up syncs today’s punches** from the device, then polls on an interval. Enable “Start when Windows starts” in Settings (`openAtLogin`).
