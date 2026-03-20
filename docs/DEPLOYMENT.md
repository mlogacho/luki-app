# Guía de Despliegue — LUKI App

## Prerrequisitos

| Herramienta | Versión mínima | Verificar |
|---|---|---|
| Node.js | 18.x LTS | `node --version` |
| npm | 9.x | `npm --version` |
| Expo CLI | 0.22+ | `npx expo --version` |
| EAS CLI (builds nativos) | 12.x | `eas --version` |
| Xcode (iOS) | 15+ | Sólo macOS |
| Android Studio (Android) | Hedgehog+ | SDK 34 |
| Git | cualquier | `git --version` |

---

## Variables de entorno

Copia el archivo de ejemplo y ajusta los valores antes de ejecutar la app:

```bash
cp .env.example .env
```

Consulta [.env.example](.env.example) para la lista completa de variables y sus descripciones.

> **Nota**: La aplicación en su estado actual no depende de variables de entorno de servidor. El archivo `.env` está preparado para cuando se implemente autenticación real y los endpoints del API.

---

## Instalación local

```bash
# 1. Clonar repositorio
git clone https://github.com/mlogacho/luki-app.git
cd luki-app

# 2. Instalar dependencias
npm install

# 3. Configurar entorno
cp .env.example .env
# Editar .env con los valores reales

# 4. Iniciar servidor Expo
npx expo start
```

---

## Desarrollo

### Web

```bash
npx expo start --web
# Abre http://localhost:8081 en el navegador
```

### iOS (simulador)

```bash
npx expo start --ios
# Requiere Xcode instalado en macOS
```

### Android (emulador)

```bash
npx expo start --android
# Requiere Android Studio + emulador configurado
```

### Dispositivo físico

Instala la app **Expo Go** en el dispositivo y escanea el QR que muestra el CLI.

---

## Builds de producción

### Recomendado (web en servidor propio)

Para este repositorio, la vía recomendada de publicación web es el script automatizado:

```bash
make deploy-prod
```

Ver detalles en la sección **Despliegue automatizado a servidor Nginx (producción)**.

### Opcional (builds nativos con EAS)

Los builds de producción se gestionan con **Expo Application Services (EAS)**.

### Configuración inicial

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Autenticarse en Expo
eas login

# Generar eas.json (si no existe)
eas build:configure
```

### Build nativo iOS

```bash
eas build --platform ios --profile production
```

### Build nativo Android

```bash
eas build --platform android --profile production
```

### Build web (estático)

```bash
npx expo export --platform web
# Salida en dist/
```

El directorio `dist/` puede desplegarse en cualquier servidor estático:
- Vercel, Netlify, GitHub Pages
- Amazon S3 + CloudFront
- Nginx / Apache

---

## Despliegue web continuo (ejemplo con Vercel)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Desde el directorio raíz del proyecto
npx expo export --platform web && vercel deploy dist/
```

O conectar el repositorio desde el dashboard de Vercel y configurar:

- **Build command**: `npx expo export --platform web`
- **Output directory**: `dist`
- **Framework preset**: Other

---

## Despliegue automatizado a servidor Nginx (producción)

El repositorio incluye un script para desplegar la exportación web en un servidor Linux con Nginx.

### Flujo que ejecuta

1. Genera build web con `npx expo export --platform web` (salvo que uses `--skip-build`)
2. Empaqueta `dist/` y lo sube por SSH
3. Crea backup remoto de `/var/www/luki-app`
4. Reemplaza archivos publicados
5. Recarga Nginx
6. Ejecuta healthcheck de frontend y API
7. Si falla healthcheck, hace rollback automático (cuando hay backup)

### Comando recomendado

```bash
bash scripts/deploy-prod.sh --key /Users/tu_usuario/.ssh/bot.pem
```

### Variables/opciones importantes

- `--host` (default: `3.135.214.120`)
- `--user` (default: `admin`)
- `--key` (default: `$HOME/.ssh/bot.pem`)
- `--web-port` (default: `8070`)
- `--api-path` (default: `/api/channels`)
- `--remote-root` (default: `/var/www/luki-app`)
- `--skip-build` (usa el `dist/` actual sin compilar)
- `--no-backup` (omite backup remoto; no recomendado)

También puedes usar variables de entorno equivalentes:

```bash
HOST=3.135.214.120 \
SSH_USER=admin \
SSH_KEY=/Users/tu_usuario/.ssh/bot.pem \
WEB_PORT=8070 \
API_PATH=/api/channels \
REMOTE_ROOT=/var/www/luki-app \
bash scripts/deploy-prod.sh
```

### Atajo con Makefile

```bash
make deploy-prod
```

### Validación post-deploy

```bash
ssh -i /ruta/clave.pem admin@<host> \
"curl -sS -i http://127.0.0.1:8070/api/channels | head -n 8"
```

Deberías ver `HTTP/1.1 200 OK` y `Content-Type: application/json`.

---

## Publicación en tiendas

### App Store (iOS)

```bash
eas submit --platform ios
```

Requisitos previos:
- Cuenta de desarrollador Apple activa
- Certificados y perfiles de aprovisionamiento configurados en EAS

### Google Play (Android)

```bash
eas submit --platform android
```

Requisitos previos:
- Cuenta de Google Play Console activa
- Clave de API de servicio JSON configurada en EAS

---

## Variables de entorno por plataforma

Expo expone las variables con prefijo `EXPO_PUBLIC_` en el cliente:

| Variable | Uso |
|---|---|
| `EXPO_PUBLIC_API_URL` | URL base del API de canales |
| `EXPO_PUBLIC_ADMIN_PASS` | Contraseña del panel admin (mover a servidor en producción) |

Para variables sensibles que no deben estar en el cliente, usar **EAS Secrets**:

```bash
eas secret:create --scope project --name MY_SECRET --value "valor"
```

---

## Checklist antes de producción

- [ ] Reemplazar autenticación mock por un backend real
- [ ] Mover `ADMIN_PASS` a variable de entorno de servidor (nunca en el cliente)
- [ ] Configurar HTTPS en el endpoint `/api/channels`
- [ ] Implementar validación de token JWT en el API
- [ ] Revisar y actualizar `app.json` (versión, bundle ID, íconos finales)
- [ ] Ejecutar `npm audit` y resolver vulnerabilidades
- [ ] Configurar monitorización de errores (Sentry u otro)
- [ ] Habilitar caché y CDN para assets estáticos en la versión web

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `make setup` | Instala dependencias y copia `.env.example` |
| `make run` | Inicia Expo en modo desarrollo |
| `make build` | Exporta la versión web estática |
| `make deploy-prod` | Publica la versión web en servidor Nginx por SSH |
| `make test` | Ejecuta la suite de tests con Jest |
| `make clean` | Limpia `node_modules/`, `dist/`, `.expo/` |

Ver [Makefile](../Makefile) para más detalles.
