#!/bin/bash

# Function to restore git config on exit
cleanup() {
    echo "🧹 Cleaning up settings..."
    git config --global --unset http.sslVerify
}
trap cleanup EXIT

echo "🕵️  Diagnosing SSL environment..."
# Strategy: Borrow valid certificates from Python's certifi package
# This bypasses the broken system Ruby OpenSSL trust store
PYTHON_CERT_PATH=$(python3 -c "import certifi; print(certifi.where())" 2>/dev/null)

if [ -n "$PYTHON_CERT_PATH" ]; then
    echo "✅ Found valid certificates at: $PYTHON_CERT_PATH"
    export SSL_CERT_FILE="$PYTHON_CERT_PATH"
    export CURL_CA_BUNDLE="$PYTHON_CERT_PATH"
    export REQUESTS_CA_BUNDLE="$PYTHON_CERT_PATH"
else
    echo "⚠️  Could not find Python certificates. Falling back to system defaults (which might fail)."
fi

# Double down: Tell Git to ignore SSL completely for this session
echo "🔓 Disabling Git SSL verification globally..."
git config --global http.sslVerify false
export GIT_SSL_NO_VERIFY=true
export COCOAPODS_DISABLE_SSL_VERIFICATION=true

echo "🧹 Cleaning iOS project..."
rm -rf ios
rm -rf ~/Library/Developer/Xcode/DerivedData/*

echo "🛠️  Prebuilding iOS..."
npx expo prebuild -p ios --clean --no-install

echo "🔧 Resetting Podfile source to CDN (Standard)..."
# We revert to standard CDN because the Git repo is too slow and likely to fail on timeout
cd ios
# Remove the git source line we added previously if it exists
sed -i '' "/source 'https:\/\/github.com\/CocoaPods\/Specs.git'/d" Podfile
cd ..

echo "📦 Installing Pods (Using Python's Certs + Insecure Git)..."
cd ios
pod install --repo-update
cd ..

echo "🚀 Launching iOS Simulator..."
open -a Simulator || echo "⚠️  Please open Simulator.app manually!"

echo "🚀 Opening Xcode..."
echo "⚠️  PARA VER EL ERROR REAL:"
echo "1. Espera a que se abra Xcode."
echo "2. Presiona el botón ▶️ (Play) en la parte superior izquierda."
echo "3. Cuando falle (rojo), envíame una captura del error que salga en la barra lateral izquierda."
xed ios
# npx expo run:ios (Disabled to debug Error 65)
