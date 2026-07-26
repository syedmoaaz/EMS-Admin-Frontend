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

## Run

```bash
npx expo start
```

Then press `a` for Android emulator, or scan the QR with Expo Go on a device.

Build APK (optional):

```bash
npx eas build -p android --profile preview
```

## Features

1. Login with **Employee ID** + admin-issued password
2. App **field check-in / check-out** starts and stops GPS (biometric at branch does **not** start field work)
3. While on field duty: location uploads every ~30s and distance is accumulated
4. Offline queue for tracking points (flushes when online)
5. GPS off / permission denied → status `GPS Disabled` for admin Live Tracking
6. Admin Live Tracking shows **distance today** per field employee
