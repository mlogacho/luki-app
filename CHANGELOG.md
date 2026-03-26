# Changelog — LUKI App

Todos los cambios notables de este proyecto se documentan en este archivo.

El formato sigue [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/)
y el proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

---

## [Unreleased]

### Añadido
- `.github/copilot-instructions.md` — prompt de desarrollo optimizado para GitHub Copilot en VS Code; incluye contexto del proyecto OTT, stack técnico, convenciones de código, infraestructura AWS y guías específicas para el Mundial FIFA 2026
- `services/favoritesStore.ts` — store Zustand para la lista personal del usuario, con persistencia en IndexedDB via `idb-keyval`
- `app/(app)/favorites.tsx` — pantalla Mi Lista completamente implementada con estado vacío, lista de títulos guardados, reproducción directa y eliminar de la lista
- `app/(app)/search.tsx` — pantalla de búsqueda con filtrado en tiempo real por título, descripción y etiquetas; soporte para marcar/desmarcar favoritos directamente desde los resultados
- Canales de transmisión del **Mundial FIFA 2026** en `contentStore.ts`: hero principal "FIFA Mundial 2026 — En Vivo" y tres canales de partidos con soporte `isLive` y `matchTime`
- Campos `isLive?: boolean` y `matchTime?: string` en la interfaz `Movie` para diferenciar contenido en vivo
- Badge "EN VIVO" en `MediaRow` y `Search` para canales live
- Botón "Mi Lista" / "Guardado" en el componente `Hero` con integración al `favoritesStore`
- Navegación al reproductor al tocar tarjetas en `MediaRow` (antes era un no-op)
- Tests unitarios: `tests/favoritesStore.test.ts` (15 tests) y `tests/contentStore.test.ts` (9 tests)
- Script `"test"` en `package.json` + configuración Jest con preset `jest-expo`

### Modificado
- `TAG_ORDER` en `home.tsx` reordenado para priorizar "Mundial 2026" y "En Vivo" sobre otros géneros
- `contentStore.ts`: contenido hero actualizado al canal Mundial 2026; canales World Cup insertados con prioridad entre admin channels y VOD catalogue
- `components/Hero.tsx`: botón "Info" reemplazado por "Mi Lista" con toggle de favoritos y badge "EN VIVO" para streams live
- `components/MediaRow.tsx`: tarjetas ahora navegan al reproductor; badge "EN VIVO" visible en canales live

### Pendiente
- Autenticación real contra un backend seguro
- Monitorización de errores en producción (Sentry u otro)
- Geo-restricciones para canales del Mundial (requiere backend)

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
