# EMS Field App (Android)

Expo React Native app for **Order Taker** / **Dispatcher** GPS attendance and live tracking.

## Setup

```bash
cd field-app
npm install
```

Set API URL (defaults to Railway production):

```
EXPO_PUBLIC_API_URL=https://ems-backend-production-9972.up.railway.app/api
```

## Run (dev / Expo Go)

```bash
npx expo start
```

Then press `a` for Android emulator, or scan the QR with Expo Go on a device.

**Note:** Expo Go does **not** fully support background GPS while the app is closed. Use a **preview APK** for real field tests.

## Staff APK (background GPS + reminders)

1. `npm i -g eas-cli` and `eas login`
2. `cd field-app` then `eas build:configure` (links Expo project id once)
3. Build:

```bash
npx eas build -p android --profile preview
```

4. Install the APK on the phone  
5. Allow **Location → All the time**, notifications, and unrestricted battery for EMS Field  
6. **Start field work** → leave the app → admin Live Tracking should keep updating  

When you change app code later, rebuild and redistribute the APK (or publish to Play).

## Features

1. Login with **Employee ID** + admin-issued password
2. App **field check-in / check-out** starts and stops GPS (biometric at branch does **not** start field work)
3. While on field duty: location uploads ~every 30s; **background** uploads on staff APK
4. Offline queue for tracking points (flushes when online)
5. After scheduled shift end + 15 minutes: local **checkout reminders** every 15 minutes until check-out
6. Open field sessions **auto-close at midnight** (Asia/Karachi) on the server
7. GPS off / permission denied → status `GPS Disabled` for admin Live Tracking
8. Admin Live Tracking shows **distance today** per field employee
