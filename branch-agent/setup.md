Complete method: test K50 attendance on your PC
Use the folder agent (not the future EXE yet). Goal: punch on K50 → agent → Railway → show in admin.

What you need
Item	Notes
Your PC
Same LAN/Wi‑Fi as the K50 (or cable to same router)
K50
Powered on, known IP (e.g. 192.168.1.201)
Live EMS
Admin: https://adilagenciesems.netlify.app
Live API
https://ems-backend-production-9972.up.railway.app/api
Node.js
Installed on your PC
Project
d:\EMS - Admin Frontend\branch-agent
Step 1 — Prepare EMS data (admin website)
Open Netlify admin → login.
Branches → create/use a real test branch (city code e.g. THT).
Open that branch → Generate secret → copy and save ems_dev_... (shown once).
Employees → Add employee:
Name, phone, branch = that branch
Device PIN = number you’ll enroll on K50 (e.g. 101) — digits only, no leading zero
Employee ID can auto-generate (THT-1)
Set work schedule (start/late threshold)
Note: Employee ID ≠ Device PIN. Machine uses PIN only.
Step 2 — Enroll on K50
On the K50, create user with User ID = Device PIN (e.g. 101).
Enroll fingerprint for that user.
Confirm device IP (menu / ZK software). PC must ping that IP:
ping 192.168.1.201
Port is usually 4370.
Step 3 — Install agent on your PC
cd "d:\EMS - Admin Frontend\branch-agent"
npm install
npm install node-zklib
Step 4 — Configure agent
cd "d:\EMS - Admin Frontend\branch-agent"
npm start
In Settings:

Field	Value
Backend API URL
https://ems-backend-production-9972.up.railway.app/api
Device secret
paste ems_dev_... from Step 1
Device IP
your K50 IP
Device port
4370
Device mode
zk (not mock)
Start when Windows starts
optional for this test
Click Save, then Sync now.

Status should move toward:

K50 Device → Connected (green)
EMS Server → Online (green)
Step 5 — First-run note (important)
On first successful connect, the agent skips old history on the device (checkpoint only).
So for your test: punch after the agent is already running, or wait for the next poll after a new punch.

Step 6 — Punch and verify
Keep agent running (npm start).
Finger punch on K50 as user 101.
Wait ~5–15 seconds (poll + sync).
In admin:
Attendance → today → that employee check-in
Status Present/Late from that employee’s schedule
Optional: check agent logs
d:\EMS - Admin Frontend\branch-agent\logs\agent.log
and outbox
d:\EMS - Admin Frontend\branch-agent\data\
Step 7 — Quick offline check (optional)
Disconnect PC internet (keep LAN to K50).
Punch again.
Pending count should rise.
Reconnect internet → pending should drain → attendance updates.
If something fails
Symptom	Check
K50 Disconnected
Same network, correct IP, ping, firewall, mode=zk, node-zklib installed
EMS Offline
API URL ends with /api, Railway up, PC has internet
Punch not in EMS
Wrong Device PIN vs K50 User ID; secret is for that branch; punch after first init; employee Active
Auth / secret error
Regenerate secret on branch, paste again, Save
Order checklist
Branch + secret in admin
Employee with Device PIN
Same PIN on K50 + fingerprint
Agent zk + Railway URL + secret + K50 IP
Agent Connected + Online
New punch
See attendance in admin
When this works on your PC, then we package the auto Windows Service / EXE for branches.