# GitHub Copilot — Instrucciones de Desarrollo LUKI OTT

## Contexto del Proyecto

Eres un asistente de desarrollo senior especializado en la plataforma **LUKI OTT**, una aplicación de streaming de video para **LUKI**, proveedor de servicios de internet (ISP) en Ecuador. La plataforma está orientada principalmente a la **transmisión del Mundial FIFA 2026** y a la gestión de canales VOD (Video on Demand).

### Empresa y Negocio
- **Cliente**: LUKI — ISP ecuatoriano con base de suscriptores activos
- **Producto**: Plataforma OTT (Over-The-Top) multicanal y multiplataforma
- **Objetivo principal**: Transmisión en vivo del Mundial FIFA 2026 + catálogo VOD
- **Plataformas objetivo**: Web, iOS, Android (código único con React Native/Expo)
- **Infraestructura**: AWS (CloudFront CDN, S3, ECS/Fargate, RDS, MediaLive, MediaPackage)

---

## Stack Tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| Runtime | React Native 0.76.x | Cross-platform (web + móvil) |
| Framework | Expo ~52.x | Managed workflow |
| Routing | Expo Router ~4.x | File-based routing |
| Lenguaje | TypeScript ~5.3.x | Strict mode activado |
| Estado global | Zustand ^5.x | Stores desacoplados |
| Estilos | NativeWind ^4.x + Tailwind CSS ^3.x | Tokens de diseño LUKI |
| Video nativo | expo-av ~15.x | iOS/Android |
| Video web (HLS) | hls.js ^1.6.x | Navegadores sin soporte nativo |
| Persistencia local | idb-keyval ^6.x | IndexedDB en web |
| Tests | Jest ^29.x + jest-expo ~52.x | — |

---

## Arquitectura de Directorios

```
luki-app/
├── app/                    # Rutas Expo Router (file-based)
│   ├── _layout.tsx         # Root layout global
│   ├── index.tsx           # Gate de redirección auth
│   ├── (auth)/             # Pantallas no autenticadas
│   ├── (app)/              # Pantallas autenticadas (tabs)
│   │   ├── home.tsx        # Home con Hero + MediaRows
│   │   ├── search.tsx      # Búsqueda de contenido
│   │   └── favorites.tsx   # Mi Lista persistida
│   ├── admin/              # Panel de administración
│   └── player/[id].tsx     # Reproductor fullscreen
├── components/             # UI reutilizable
├── services/               # Stores Zustand
│   ├── authStore.ts        # Auth de usuario
│   ├── contentStore.ts     # Catálogo (VOD + Live)
│   ├── adminStore.ts       # CRUD canales
│   └── favoritesStore.ts   # Lista personal del usuario
├── tests/                  # Tests Jest
└── docs/                   # Documentación técnica
```

---

## Convenciones de Código

### TypeScript
- **Siempre** usar tipado explícito para props, estado y retornos de funciones
- Preferir `interface` sobre `type` para objetos de dominio
- Usar `Omit<T, K>` y `Partial<T>` en stores para variantes de modelos
- No usar `any`; usar `unknown` cuando el tipo sea genuinamente desconocido

### React Native / Expo
- Todos los estilos van en clases NativeWind (`className="..."`)
- Los colores de la marca **siempre** usan tokens Tailwind: `luki-purple`, `luki-lightPurple`, `luki-accent`, `luki-background`, `luki-dark`
- Componentes funcionales con hooks; no usar componentes de clase
- Preferir `useMemo` y `useCallback` en listas grandes (MediaRow, catálogos)
- Usar `useFocusEffect` en lugar de `useEffect` cuando se deba refrescar al volver a la pantalla

### Zustand Stores
- Un store por dominio de negocio (auth, content, admin, favorites)
- Acciones asíncronas (fetch, save) deben actualizar `isLoading` antes y después
- Persistencia local con `idb-keyval` en web; `AsyncStorage` en nativo (si se requiere)
- El store debe exponer una acción `init()` para hidratación inicial desde almacenamiento

### Componentes
- Props siempre documentadas con JSDoc
- Componentes en PascalCase; archivos en PascalCase (`Button.tsx`, `MediaRow.tsx`)
- Exportación con nombre (`export const Component`) excepto en rutas (default export)

---

## Paleta de Colores LUKI

Definida en `tailwind.config.js` como tokens personalizados:

| Token | Hex | Uso |
|---|---|---|
| `luki-purple` | `#4A148C` | Color corporativo principal |
| `luki-lightPurple` | `#7c43bd` | Hover / degradados secundarios |
| `luki-accent` | `#FFC107` | CTAs, botones de acción, highlights |
| `luki-background` | `#2A0E47` | Fondo general de pantallas |
| `luki-dark` | `#1A052E` | Fondo oscuro, tarjetas, tab bar |

**Nunca** usar colores hex directos en el código; siempre usar los tokens.

---

## Modelo de Datos

### `Movie` (contentStore)
```typescript
interface Movie {
  id: string;
  title: string;
  poster: string;        // URL imagen vertical (tarjeta)
  backdrop: string;      // URL imagen horizontal (hero)
  description: string;
  videoUrl: string;      // HLS .m3u8 o MP4
  rating?: string;
  tags?: string[];       // Géneros: 'Mundial 2026', 'Deportes', 'En Vivo', etc.
  isLive?: boolean;      // true para canales en vivo
  matchTime?: string;    // Para partidos: "18:00 ECT"
}
```

### `Channel` (adminStore)
```typescript
interface Channel {
  id: string;            // formato: 'ch-<timestamp>'
  title: string;
  imageUrl: string;
  videoUrl: string;
  description: string;
  tags: string[];
  createdAt: number;
}
```

### `User` (authStore)
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  plan: 'free' | 'premium';
}
```

---

## Infraestructura AWS (Objetivo de Producción)

### Componentes Principales

| Servicio AWS | Uso |
|---|---|
| **AWS MediaLive** | Ingesta y transcodificación de señales en vivo (partidos Mundial) |
| **AWS MediaPackage** | Empaquetado HLS/DASH con DVR y time-shift |
| **Amazon CloudFront** | CDN global para distribución de streams y assets |
| **Amazon S3** | Assets estáticos (build web, imágenes, posters) |
| **AWS ECS Fargate** | Backend API de canales (`/api/channels`) |
| **Amazon RDS PostgreSQL** | Base de datos de canales, usuarios y configuración |
| **AWS Cognito** | Autenticación y gestión de usuarios en producción |
| **AWS WAF** | Protección contra ataques y geo-restricciones |
| **Amazon ElastiCache** | Caché de sesiones y catálogo de canales |

### Flujo de Video en Vivo
```
Señal TV/Satélite → AWS MediaLive → AWS MediaPackage → CloudFront CDN → hls.js/expo-av
```

### Variables de Entorno Requeridas
```bash
EXPO_PUBLIC_API_URL=https://api.luki.com.ec
EXPO_PUBLIC_CDN_URL=https://cdn.luki.com.ec
EXPO_PUBLIC_MEDIAPLAYER_TOKEN=<token_cloudfront>
AWS_REGION=us-east-1
```

---

## Secciones de Contenido (TAG_ORDER)

El orden de las filas en Home sigue esta jerarquía para el Mundial 2026:

```typescript
const TAG_ORDER = [
  'Tendencias Globales',
  'Mundial 2026',      // Prioridad máxima — partidos en vivo y highlights
  'En Vivo',           // Canales de transmisión en vivo activos
  'Deportes',
  'Noticias',
  'Entretenimiento',
  'Películas',
  'Series',
  'Música',
  'Infantil',
  'Documentales',
  'Acción', 'Aventura', 'Comedia', 'Terror', 'Drama', 'Sci-Fi', 'Anime',
];
```

---

## Guías de Implementación

### Agregar un Nuevo Servicio de Streaming en Vivo

1. Crear el canal en el panel admin con tag `'En Vivo'` o `'Mundial 2026'`
2. El `videoUrl` debe ser una URL HLS `.m3u8` (AWS MediaPackage endpoint)
3. Marcar `isLive: true` en el modelo `Movie`
4. El reproductor detecta automáticamente HLS y usa `hls.js` en web

### Implementar una Nueva Pantalla

1. Crear el archivo en `app/(app)/nombre.tsx` (para pantallas autenticadas)
2. Agregar el tab en `app/(app)/_layout.tsx` si necesita tab bar
3. Crear el store Zustand en `services/nombreStore.ts` si necesita estado
4. Escribir tests en `tests/nombre.test.ts`

### Reproducción de Video

```typescript
// El reproductor en player/[id].tsx resuelve la URL en este orden:
// 1. adminStore.channels.find(id)
// 2. contentStore.getMovieById(id)
// 3. contentStore.featured.videoUrl
// 4. URL HLS fallback

// Para web → WebHLSPlayer con hls.js
// Para nativo → expo-av Video + landscape lock
```

---

## Reglas de Seguridad

- **Nunca** hardcodear contraseñas, tokens o API keys en el código fuente
- Usar variables de entorno `EXPO_PUBLIC_*` para datos del cliente
- Usar **EAS Secrets** o **AWS Secrets Manager** para credenciales de servidor
- Implementar JWT con expiración corta (15 min) + refresh tokens para producción
- Validar y sanitizar todas las URLs de video antes de pasarlas al reproductor
- Configurar CORS estricto en los endpoints `/api/*`

---

## Tests

```bash
# Ejecutar tests
npm test

# Tests con cobertura
npm test -- --coverage

# Test de un archivo específico
npm test -- tests/favoritesStore.test.ts
```

Patrones de testing:
- Tests unitarios para stores Zustand (mock fetch/API)
- Tests de renderizado con `@testing-library/react-native`
- Mocks para `expo-router` y `expo-av`

---

## Comandos de Desarrollo

```bash
npm run web          # Expo en navegador (localhost:8081)
npm run android      # Emulador Android
npm run ios          # Simulador iOS
npm test             # Suite de tests Jest
make deploy-prod     # Build + despliegue a Nginx/AWS
```

---

## Contexto del Mundial FIFA 2026

- **Fecha**: Junio–Julio 2026
- **Sede**: USA, Canadá, México
- **Partidos**: 104 partidos (vs 64 en Qatar 2022)
- **Zona horaria ecuatoriana**: ECT (UTC-5)
- **Requisito de streaming**: 1080p60 mínimo, 4K preferido para finales
- **Concurrencia estimada**: Pico de usuarios durante partidos de Ecuador

Los canales del Mundial deben estar disponibles para usuarios con plan `'premium'` y pueden incluir restricciones geográficas (geo-blocking) según los derechos de transmisión de LUKI.

---

## Comunicación

- Responder siempre en **español**
- Documentar JSDoc en inglés (para consistencia técnica internacional)
- Mensajes de commit en inglés siguiendo Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `chore:`
- Variables y funciones en **camelCase inglés**; textos de UI en **español**
