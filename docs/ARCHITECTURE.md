# Arquitectura — LUKI App

## 1. Descripción general

LUKI App es una plataforma de streaming de video construida con **React Native + Expo**. Funciona en iOS, Android y web a partir de una única base de código TypeScript. Incluye un área pública para usuarios finales y un panel de administración protegido por contraseña.

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|---|---|---|
| Runtime | React Native | 0.76.9 |
| Framework | Expo | ~52.0.25 |
| Routing | Expo Router | ~4.0.16 |
| Lenguaje | TypeScript | ~5.3.3 |
| Estado global | Zustand | ^5.0.0 |
| Estilos | NativeWind + Tailwind CSS | ^4.0.1 / ^3.4.1 |
| Video nativo | expo-av | ~15.0.1 |
| Video web (HLS) | hls.js | ^1.6.15 |
| Gradientes | expo-linear-gradient | ~14.0.1 |
| Orientación | expo-screen-orientation | ~8.0.2 |
| Bundler | Metro + Babel | — |
| Tests | Jest + jest-expo | ^29 / ~52 |

---

## 3. Estructura de directorios

```
luki-app/
├── app/                      # Rutas (Expo Router — file-based routing)
│   ├── _layout.tsx           # Root Stack (splash + StatusBar global)
│   ├── index.tsx             # Redirect gate: auth check inicial
│   ├── global.css            # Estilos Tailwind globales (NativeWind)
│   ├── (auth)/               # Grupo: pantallas no autenticadas
│   │   ├── _layout.tsx       # Stack headerless
│   │   └── login.tsx         # Pantalla de login
│   ├── (app)/                # Grupo: pantallas autenticadas
│   │   ├── _layout.tsx       # Tab navigator (Inicio / Buscar / Mi Lista)
│   │   ├── home.tsx          # Pantalla principal (Hero + filas por género)
│   │   ├── search.tsx        # Búsqueda (pendiente)
│   │   └── favorites.tsx     # Mi Lista (pendiente)
│   ├── admin/                # Panel de administración
│   │   ├── _layout.tsx       # Stack admin
│   │   ├── index.tsx         # Login con contraseña
│   │   ├── panel.tsx         # Listado de canales (CRUD)
│   │   └── form.tsx          # Formulario añadir / editar canal
│   └── player/
│       └── [id].tsx          # Reproductor de video a pantalla completa
├── components/               # Componentes de UI reutilizables
│   ├── Button.tsx            # Botón primario LUKI
│   ├── Input.tsx             # Campo de texto con estilos LUKI
│   ├── Hero.tsx              # Banner hero con gradiente
│   └── MediaRow.tsx          # Fila horizontal de tarjetas de contenido
├── services/                 # Capa de estado (Zustand stores)
│   ├── authStore.ts          # Autenticación de usuario
│   ├── contentStore.ts       # Catálogo de contenido (VOD + Mundial 2026)
│   ├── adminStore.ts         # CRUD de canales administrados
│   └── favoritesStore.ts     # Lista personal del usuario (IndexedDB)
├── assets/                   # Imágenes y recursos estáticos
├── docs/                     # Documentación del proyecto
├── scripts/                  # Scripts de automatización
└── tests/                    # Pruebas automatizadas
```

---

## 4. Diagrama de módulos

```
┌──────────────────────────────────────────────────────────────────┐
│                          EXPO ROUTER                             │
│                                                                  │
│  index.tsx ──► (auth)/login  ─────────────────────────────────► │
│       │                                                          │
│       └──────► (app)/home ──► player/[id]                       │
│                     │                                            │
│              (app)/search                                        │
│              (app)/favorites                                     │
│                                                                  │
│  admin/index ──► admin/panel ──► admin/form                      │
└──────────────────────────────────────────────────────────────────┘
          │               │                    │
          ▼               ▼                    ▼
    authStore       contentStore          adminStore
          │               │                    │
          │           (hardcoded           REST API
          │            catalogue)         /api/channels
          │               │
          └───────────────┘
              Player resolves
              video URL from
              either store
```

---

## 5. Flujo principal de operación

### 5.1 Inicio de sesión de usuario

```
app/index.tsx
  │
  ├── authStore.user !== null  →  /(app)/home
  └── authStore.user === null  →  /(auth)/login
                                                 │
                                        authStore.login(email, password)
                                          [mock: cualquier @email + 12345]
                                                 │
                                        router.replace('/(app)/home')
```

### 5.2 Carga del catálogo en Home

```
home.tsx mounted
  │
  ├── adminStore.init()        ← GET /api/channels (Bearer token = ADMIN_PASS)
  │       └── popula channels[]
  │
  └── contentStore.fetchContent()
          ├── carga 4 películas hardcodeadas
          └── merge con adminStore.channels (admin tiene prioridad)
                 │
                 ▼
        Hero (item destacado)
        + MediaRow por cada tag según TAG_ORDER
```

### 5.3 Reproducción de video

```
player/[id].tsx
  │
  ├── adminStore.channels.find(id)     (prioridad 1)
  ├── contentStore.getMovieById(id)    (prioridad 2)
  ├── contentStore.featured.videoUrl  (prioridad 3)
  └── URL fallback HLS                (prioridad 4)
         │
         ├── Platform.OS === 'web'  → WebHLSPlayer (hls.js)
         └── Platform.OS !== 'web' → expo-av Video + landscape lock
```

### 5.4 Gestión de canales (Admin)

```
admin/index.tsx
  └── adminStore.adminLogin(password)
        [contraseña hardcodeada: luki2024]
              │
        router.replace('/admin/panel')

admin/panel.tsx                          admin/form.tsx
  ├── adminStore.channels[]     ◄──────  addChannel(channel)
  ├── deleteChannel(id)                  updateChannel(id, data)
  └── adminLogout()                           │
                                         POST /api/channels (Bearer token)
```

---

## 6. Modelo de datos

### `User` (authStore)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único (UUID mock) |
| `email` | `string` | Email del usuario |
| `name` | `string` | Nombre para mostrar |

### `Movie` (contentStore)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único |
| `title` | `string` | Título del contenido |
| `description` | `string` | Sinopsis |
| `imageUrl` | `string` | URL de la imagen de portada |
| `videoUrl` | `string` | URL del stream de video |
| `tags` | `string[]` | Géneros/categorías |
| `featured` | `boolean?` | Si es el ítem destacado en el Hero |

### `Channel` (adminStore)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador único |
| `title` | `string` | Nombre del canal |
| `description` | `string` | Descripción |
| `imageUrl` | `string` | URL o base64 de la imagen de portada |
| `videoUrl` | `string` | URL del stream HLS/MP4 |
| `tags` | `string[]` | Géneros/categorías |

---

## 7. Paleta de colores LUKI

Definida en `tailwind.config.js` como tokens personalizados:

| Token | Hex | Uso |
|---|---|---|
| `luki-purple` | `#4A148C` | Color corporativo principal |
| `luki-lightPurple` | `#7c43bd` | Hover / degradados secundarios |
| `luki-accent` | `#FFC107` | CTAs, botones de acción |
| `luki-background` | `#2A0E47` | Fondo general de pantallas |
| `luki-dark` | `#1A052E` | Fondo más oscuro, tarjetas |

---

## 8. Integraciones externas

| Integración | Descripción | Estado |
|---|---|---|
| REST `/api/channels` | CRUD de canales admin (GET/POST con Bearer token) | Activo |
| HLS CDN (`g2qd3e2ay7an-hls-live.5centscdn.com`) | Stream en vivo de prueba | Hardcodeado |
| TMDB image CDN (`image.tmdb.org`) | Imágenes de portada del catálogo hardcodeado | Hardcodeado |
| hls.js (npm) | Reproducción HLS en navegadores sin soporte nativo | Activo (web) |

---

## 9. Roles y acceso

| Rol | Acceso | Autenticación |
|---|---|---|
| **Usuario** | Home, Búsqueda, Mi Lista, Reproductor | Email `@*` + contraseña `12345` (mock) |
| **Administrador** | Panel de canales, formulario CRUD | Contraseña directa: `luki2024` |

> ⚠️ **Advertencia de seguridad**: Las contraseñas de autenticación están hardcodeadas en el cliente. Esto es válido solo para prototipo. Antes de producción, se debe implementar autenticación real contra un backend seguro.

---

## 10. Estado del proyecto

| Área | Estado |
|---|---|
| Autenticación de usuario | Prototipo (mock) |
| Catálogo de contenido | Funcional (hardcodeado + admin channels + canales Mundial 2026) |
| Reproductor de video | Funcional (HLS web + expo-av nativo) |
| Panel admin CRUD | Funcional |
| Búsqueda | Funcional (`app/(app)/search.tsx`) |
| Mi Lista / Favoritos | Funcional — persistido en IndexedDB (`app/(app)/favorites.tsx`) |
| Tests automatizados | Funcional — `tests/favoritesStore.test.ts`, `tests/contentStore.test.ts` |
| Backend/API real | Pendiente |
| Autenticación en producción (AWS Cognito) | Pendiente |
| Streaming en vivo Mundial 2026 (AWS MediaLive) | Pendiente (canales placeholder listos) |
