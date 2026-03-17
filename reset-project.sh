#!/bin/bash
echo "🚨 STARTING MASTER RESET (NUCLEAR OPTION) 🚨"

# 1. Clean Environment
echo "🧹 Cleaning EVERYTHING (node_modules, builds, caches)..."
rm -rf node_modules package-lock.json android ios .expo
rm -rf ~/Library/Developer/Xcode/DerivedData/*
watchman watch-del-all 2>/dev/null
rm -rf $TMPDIR/haste-map-*
rm -rf $TMPDIR/metro-cache

# 2. Verify Configs
echo "🧩 Verifying critical configurations..."
if [ ! -f "react-native.config.js" ]; then
    echo "⚠️  Restoring react-native.config.js..."
    echo "module.exports = { dependencies: { 'react-native-worklets': { platforms: { android: null, ios: null } } } };" > react-native.config.js
fi

# 3. Install Dependencies
echo "📦 Installing Dependencies..."
npm install

echo "🔧 Fixing critical packages (Router & Reanimated)..."
npx expo install expo-router react-native-reanimated --fix

# 4. Platform Selection
echo "✅ Environment Ready."
echo "------------------------------------------------"
echo "Select the platform to launch (enter number):"
echo "1) Android (Emulator)"
echo "2) iOS (Simulator)"
echo "3) Web (Browser)"
echo "------------------------------------------------"
read -p "Option: " platform

if [ "$platform" == "1" ]; then
    echo "🤖 Launching Android..."
    sh fix-android.sh
elif [ "$platform" == "2" ]; then
    echo "🍎 Launching iOS..."
    sh fix-ios.sh
elif [ "$platform" == "3" ]; then
    echo "🌐 Launching Web..."
    npx expo start --web -c
else
    echo "❌ Invalid option."
fi
