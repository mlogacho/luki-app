#!/usr/bin/env bash
# =============================================================================
# scripts/deploy-prod.sh — Deploy web estático de LUKI a servidor Nginx
# =============================================================================
# Flujo:
# 1) (Opcional) Build local con Expo export web
# 2) Empaquetar dist/
# 3) Subir paquete por SSH
# 4) Backup remoto + reemplazo de /var/www/luki-app
# 5) Reload de Nginx + healthcheck de frontend y API
# =============================================================================

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[LUKI-DEPLOY]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
fatal() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

HOST="${HOST:-3.135.214.120}"
SSH_USER="${SSH_USER:-admin}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/bot.pem}"
WEB_PORT="${WEB_PORT:-8070}"
API_PATH="${API_PATH:-/api/channels}"
REMOTE_ROOT="${REMOTE_ROOT:-/var/www/luki-app}"
SKIP_BUILD="false"
NO_BACKUP="false"

usage() {
  cat <<EOF
Uso:
  bash scripts/deploy-prod.sh [opciones]

Opciones:
  --host <ip|dominio>        Host remoto (default: ${HOST})
  --user <usuario>           Usuario SSH (default: ${SSH_USER})
  --key <ruta_pem>           Clave privada SSH (default: ${SSH_KEY})
  --web-port <puerto>        Puerto Nginx app (default: ${WEB_PORT})
  --api-path <ruta>          Ruta health API (default: ${API_PATH})
  --remote-root <ruta>       Web root remoto (default: ${REMOTE_ROOT})
  --skip-build               Omitir build local (usa dist/ actual)
  --no-backup                Omitir backup remoto antes de reemplazar
  -h, --help                 Mostrar ayuda

Ejemplo:
  bash scripts/deploy-prod.sh --key /Users/tu_usuario/.ssh/bot.pem
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --host)
      HOST="$2"; shift 2 ;;
    --user)
      SSH_USER="$2"; shift 2 ;;
    --key)
      SSH_KEY="$2"; shift 2 ;;
    --web-port)
      WEB_PORT="$2"; shift 2 ;;
    --api-path)
      API_PATH="$2"; shift 2 ;;
    --remote-root)
      REMOTE_ROOT="$2"; shift 2 ;;
    --skip-build)
      SKIP_BUILD="true"; shift ;;
    --no-backup)
      NO_BACKUP="true"; shift ;;
    -h|--help)
      usage; exit 0 ;;
    *)
      fatal "Opción no reconocida: $1"
      ;;
  esac
done

command -v ssh >/dev/null 2>&1 || fatal "ssh no está instalado"
command -v scp >/dev/null 2>&1 || fatal "scp no está instalado"
command -v tar >/dev/null 2>&1 || fatal "tar no está instalado"

[[ -f "$SSH_KEY" ]] || fatal "No existe la clave SSH: $SSH_KEY"

if [[ "$SKIP_BUILD" != "true" ]]; then
  command -v npm >/dev/null 2>&1 || fatal "npm no está instalado"
  command -v npx >/dev/null 2>&1 || fatal "npx no está instalado"

  if [[ ! -d node_modules ]]; then
    info "node_modules no existe. Instalando dependencias..."
    npm install
  fi

  info "Generando build web con Expo..."
  npx expo export --platform web
else
  warn "Se omite el build local (--skip-build)."
fi

[[ -d dist ]] || fatal "No se encontró dist/. Ejecuta build o elimina --skip-build"

TS="$(date +%Y%m%d_%H%M%S)"
LOCAL_ARCHIVE="/tmp/luki-dist-${TS}.tar.gz"
REMOTE_ARCHIVE="/tmp/luki-dist-${TS}.tar.gz"

info "Empaquetando dist/ en ${LOCAL_ARCHIVE}"
COPYFILE_DISABLE=1 tar -C dist -czf "$LOCAL_ARCHIVE" .

info "Subiendo artefacto al servidor ${SSH_USER}@${HOST}"
scp -i "$SSH_KEY" "$LOCAL_ARCHIVE" "${SSH_USER}@${HOST}:${REMOTE_ARCHIVE}"

info "Aplicando deploy remoto en ${REMOTE_ROOT}"
ssh -i "$SSH_KEY" "${SSH_USER}@${HOST}" \
  "DEPLOY_TS='${TS}' REMOTE_ROOT='${REMOTE_ROOT}' REMOTE_ARCHIVE='${REMOTE_ARCHIVE}' WEB_PORT='${WEB_PORT}' API_PATH='${API_PATH}' NO_BACKUP='${NO_BACKUP}' bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail

BACKUP_PATH="${REMOTE_ROOT}_backup_${DEPLOY_TS}"
STAGE_DIR="/tmp/luki-stage-${DEPLOY_TS}"

sudo mkdir -p "$REMOTE_ROOT"

if [[ "${NO_BACKUP}" != "true" ]]; then
  sudo cp -a "$REMOTE_ROOT" "$BACKUP_PATH"
  echo "Backup creado: $BACKUP_PATH"
else
  echo "Backup omitido (--no-backup)"
fi

rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR"
tar -xzf "$REMOTE_ARCHIVE" -C "$STAGE_DIR"

sudo rm -rf "$REMOTE_ROOT"/*
sudo cp -a "$STAGE_DIR"/. "$REMOTE_ROOT"/
sudo chown -R www-data:www-data "$REMOTE_ROOT"

sudo nginx -t
sudo systemctl reload nginx

WEB_CODE="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${WEB_PORT}/")"
API_CODE="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${WEB_PORT}${API_PATH}")"

if [[ "$WEB_CODE" != "200" || "$API_CODE" != "200" ]]; then
  echo "Healthcheck falló: WEB=${WEB_CODE}, API=${API_CODE}"
  if [[ "${NO_BACKUP}" != "true" && -d "$BACKUP_PATH" ]]; then
    echo "Iniciando rollback automático..."
    sudo rm -rf "$REMOTE_ROOT"/*
    sudo cp -a "$BACKUP_PATH"/. "$REMOTE_ROOT"/
    sudo chown -R www-data:www-data "$REMOTE_ROOT"
    sudo systemctl reload nginx
    echo "Rollback aplicado."
  fi
  exit 1
fi

rm -rf "$STAGE_DIR"
rm -f "$REMOTE_ARCHIVE"

echo "Deploy OK: WEB=${WEB_CODE}, API=${API_CODE}, TS=${DEPLOY_TS}"
REMOTE_SCRIPT

rm -f "$LOCAL_ARCHIVE"
info "Deploy completado correctamente."
