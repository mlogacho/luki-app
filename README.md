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
[PENDIENTE — completar cuando se implemente]

## Estructura de Carpetas
Estructura verificada en el repositorio actual:

- `(app)/`, `(auth)/`, `(tabs)/`: salida estática web exportada (HTML)
- `app/`: rutas fuente con Expo Router
- `app/(auth)/`: flujo de autenticación
- `app/(app)/`: flujo principal de usuario (inicio, búsqueda, favoritos)
- `app/admin/`: panel administrativo (login, listado y formulario)
- `app/player/`: reproducción de video
- `components/`: componentes reutilizables de interfaz
- `services/`: estado y lógica de negocio (auth, contenido, administración)
- `assets/`: recursos estáticos
- `_expo/`: artefactos de exportación web estática
- `admin/`, `player/`: páginas HTML estáticas exportadas
