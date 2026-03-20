#!/usr/bin/env bash
# =============================================================================
# scripts/setup.sh — Configuración inicial del entorno de desarrollo LUKI App
# =============================================================================
# Uso:
#   bash scripts/setup.sh
# =============================================================================

set -euo pipefail

# ── colores ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # sin color

info()    { echo -e "${GREEN}[LUKI]${NC} $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── 1. Verificar Node.js ──────────────────────────────────────────────────────
info "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    error "Node.js no encontrado. Instala Node.js 18 LTS desde https://nodejs.org"
fi

NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if (( NODE_MAJOR < 18 )); then
    warn "Node.js $NODE_VERSION detectado. Se recomienda v18 LTS o superior."
else
    info "Node.js $NODE_VERSION ✓"
fi

# ── 2. Verificar npm ───────────────────────────────────────────────────────────
info "Verificando npm..."
if ! command -v npm &> /dev/null; then
    error "npm no encontrado. Se instala automáticamente con Node.js."
fi
NPM_VERSION=$(npm --version)
info "npm $NPM_VERSION ✓"

# ── 3. Instalar dependencias ──────────────────────────────────────────────────
info "Instalando dependencias..."
npm install
info "Dependencias instaladas ✓"

# ── 4. Configurar variables de entorno ────────────────────────────────────────
if [ -f ".env" ]; then
    warn ".env ya existe, omitiendo copia de .env.example"
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        info ".env creado a partir de .env.example ✓"
        warn "Edita .env con los valores reales antes de ejecutar la app."
    else
        warn ".env.example no encontrado, no se pudo crear .env"
    fi
fi

# ── 5. Verificar Expo CLI ──────────────────────────────────────────────────────
info "Verificando Expo CLI..."
if command -v expo &> /dev/null; then
    EXPO_VERSION=$(expo --version 2>/dev/null || echo "desconocida")
    info "Expo CLI $EXPO_VERSION ✓"
else
    warn "Expo CLI no está instalado globalmente."
    info "Puedes ejecutar la app con: npx expo start"
fi

# ── 6. Resumen ─────────────────────────────────────────────────────────────────
echo ""
info "═══════════════════════════════════════════════"
info "  LUKI App — entorno de desarrollo listo"
info "═══════════════════════════════════════════════"
echo ""
echo "  Iniciar desarrollo:  npx expo start"
echo "  Web:                 npx expo start --web"
echo "  iOS:                 npx expo start --ios"
echo "  Android:             npx expo start --android"
echo "  Tests:               npm test"
echo ""
