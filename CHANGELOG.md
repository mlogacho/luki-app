# Changelog — LUKI App

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Pendiente
- Implementar pantalla de búsqueda (`app/(app)/search.tsx`)
- Implementar pantalla Mi Lista / Favoritos (`app/(app)/favorites.tsx`)
- Autenticación real contra un backend seguro
- Tests unitarios e integración
- Monitorización de errores en producción

---

## [0.1.0-alpha] - 2024

### Añadido
- Estructura base del proyecto con Expo Router y file-based routing
- Autenticación de usuario (mock) con Zustand — `services/authStore.ts`
- Catálogo de contenido con películas hardcodeadas — `services/contentStore.ts`
- Panel de administración con CRUD de canales — `services/adminStore.ts`
- Sincronización de canales con REST API `/api/channels` (GET/POST)
- Pantalla principal con banner Hero y filas de contenido por género (`app/(app)/home.tsx`)
- Reproductor de video fullscreen — HLS via hls.js en web, expo-av en nativo (`app/player/[id].tsx`)
- Panel admin: login, listado de canales, formulario add/edit con subida de imagen (`app/admin/`)
- Componentes de UI: `Button`, `Input`, `Hero`, `MediaRow`
- Paleta de colores LUKI con tokens Tailwind personalizados (`tailwind.config.js`)
- Configuración de NativeWind + Metro + Babel + PostCSS
- Soporte para orientación landscape en el reproductor nativo
- Compresión de imágenes en el cliente (JPEG 0.75, máx. 800 px) para el formulario admin
- `README.md` con descripción, instalación y estructura del proyecto
- `docs/ARCHITECTURE.md` con diagrama de módulos, flujos y modelo de datos
- `docs/DEPLOYMENT.md` con guías de despliegue para web, iOS y Android
- `.env.example` con variables de entorno y descripción
- `docs/CONTRIBUTING.md` con guía de contribución
- `scripts/setup.sh` con script de configuración inicial
- `Makefile` con targets de desarrollo y CI

### Seguridad
- ⚠ Contraseñas de autenticación hardcodeadas — válido sólo para prototipo
- ⚠ `ADMIN_PASS` expuesta en el cliente — pendiente migración a backend

[Unreleased]: https://github.com/mlogacho/luki-app/compare/v0.1.0-alpha...HEAD
[0.1.0-alpha]: https://github.com/mlogacho/luki-app/releases/tag/v0.1.0-alpha
