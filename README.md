# LUKI App

## Descripción
LUKI App es una aplicación de streaming construida con Expo y React Native (compatible con web y móvil), con navegación por secciones, reproducción de video y un panel administrativo para gestionar canales de contenido.

## Propósito
Centralizar la experiencia de consumo de contenido audiovisual de LUKI, incluyendo autenticación básica, catálogo por categorías y administración de canales para su publicación en la aplicación.

## Tecnologías
- TypeScript
- React Native
- Expo
- Expo Router
- Zustand
- NativeWind + Tailwind CSS
- Expo AV
- hls.js (reproducción HLS en web)

## Estado
Prototipo funcional / preproducción.

## Autor/Responsable
Marco Logacho — Director de Desarrollo Digital e IA, DataCom S.A.

## Repositorio
https://github.com/mlogacho/luki-app

## Instalación Rápida
```bash
git clone https://github.com/mlogacho/luki-app.git
cd luki-app
npm install
cp .env.example .env
npx expo start --web
```

## Comandos útiles
- `make setup`: instala dependencias y crea `.env` desde `.env.example`
- `make run`: inicia Expo en modo desarrollo
- `make web`: inicia Expo en modo web
- `make build`: exporta sitio estático en `dist/`
- `make deploy-prod`: build y despliegue web por SSH a Nginx

## Despliegue a producción (web)
- Ejecutar deploy automatizado: `make deploy-prod`
- Guía completa: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

## Documentación
- Arquitectura: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Despliegue: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Contribución: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)

## Estructura de Carpetas
Estructura verificada en el repositorio actual:

- `app/`: rutas fuente con Expo Router
- `app/(auth)/`: flujo de autenticación
- `app/(app)/`: flujo principal de usuario (inicio, búsqueda, favoritos)
- `app/admin/`: panel administrativo (login, listado y formulario)
- `app/player/`: reproducción de video
- `components/`: componentes reutilizables de interfaz
- `services/`: estado y lógica de negocio (auth, contenido, administración)
- `assets/`: recursos estáticos
- `docs/`: documentación técnica y operativa
- `scripts/`: automatizaciones de setup y despliegue

Artefactos generados de export web en la raíz (no código fuente):
- `_expo/`, `(app)/`, `(auth)/`, `(tabs)/`, `admin/`, `player/`, `*.html`
