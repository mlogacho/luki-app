#!/bin/bash
echo "🧹 Cleaning project..."
rm -rf node_modules package-lock.json android ios .expo
# rm postcss.config.js 2>/dev/null (Preserving for Web)
# Verify react-native.config.js exists (crucial for build success)
if [ ! -f "react-native.config.js" ]; then
    echo "⚠️  Error: react-native.config.js is missing! Recreating it..."
    echo "module.exports = { dependencies: { 'react-native-worklets': { platforms: { android: null, ios: null } } } };" > react-native.config.js
fi

echo "📦 Installing dependencies (Legacy + Core Worklets)..."
npm install

echo "🛠️  Prebuilding Android (Generating Native Code)..."

# 4. Emulator Launch Fix (Robust Mode)
echo "🔄 Restarting ADB Server..."
$HOME/Library/Android/sdk/platform-tools/adb kill-server
$HOME/Library/Android/sdk/platform-tools/adb start-server

echo "📱 Attempting to Cold Boot Emulator (Wiping Data)..."
pkill -f qemu-system-x86_64 2>/dev/null # Kill stuck emulators
$HOME/Library/Android/sdk/emulator/emulator @Medium_Phone_API_36.1 -wipe-data -no-snapshot-load -gpu swiftshader_indirect &

echo "⏳ Waiting for emulator to FULLY BOOT (this can take 2-3 mins)..."
$HOME/Library/Android/sdk/platform-tools/adb wait-for-device
while [ "$($HOME/Library/Android/sdk/platform-tools/adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" != "1" ]; do
    printf "."
    sleep 2
done
echo ""
echo "✅ Emulator is online and ready!"

echo "🚀 Launching Development Build..."
echo "NOTE: If prompted, select your emulator."
echo "NOTE: Do NOT use Expo Go. Wait for 'luki-app' to open."
npx expo run:android

