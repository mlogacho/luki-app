# Guía de contribución — LUKI App

Gracias por tu interés en contribuir a LUKI App. Esta guía describe el flujo de trabajo, convenciones y requisitos para enviar cambios al repositorio.

---

## Código de conducta

Al contribuir, te comprometes a mantener un ambiente respetuoso y colaborativo. Los comentarios y revisiones deben ser constructivos y orientados al código, no a las personas.

---

## Prerrequisitos

- Node.js 18.x LTS o superior
- npm 9.x o superior
- Git configurado con tu nombre y email

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## Flujo de trabajo

### 1. Fork y clon

```bash
# Haz un fork desde https://github.com/mlogacho/luki-app
git clone https://github.com/<tu-usuario>/luki-app.git
cd luki-app
git remote add upstream https://github.com/mlogacho/luki-app.git
```

### 2. Crear una rama

Usa el prefijo correspondiente al tipo de cambio:

| Prefijo | Uso |
|---|---|
| `feat/` | Nueva funcionalidad |
| `fix/` | Corrección de bug |
| `docs/` | Cambios en documentación |
| `refactor/` | Refactorización sin cambio de comportamiento |
| `test/` | Añadir o corregir tests |
| `chore/` | Tareas de mantenimiento (deps, config) |

```bash
git checkout -b feat/nombre-descriptivo
```

### 3. Desarrollar

- Sigue las convenciones de código descritas abajo.
- Añade JSDoc a toda función o componente público que crees.
- Si modificas la arquitectura, actualiza `docs/ARCHITECTURE.md`.

### 4. Tests

```bash
npm test
```

Asegúrate de que todos los tests existentes pasen antes de enviar el PR.

### 5. Commit

Usa [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/):

```
<tipo>(ámbito opcional): descripción corta en imperativo

Cuerpo opcional con más detalle.

Fixes #123
```

Ejemplos:
```
feat(player): agregar soporte para subtítulos WebVTT
fix(admin): corregir validación de URL de imagen vacía
docs(architecture): actualizar diagrama de módulos
```

### 6. Pull Request

- Abre el PR **hacia `master`** del repositorio original.
- Describe qué cambia y por qué.
- Referencia el issue relacionado si existe (`Closes #N`).
- Asegúrate de que el CI pase antes de solicitar revisión.

---

## Convenciones de código

### TypeScript

- Usar `interface` para tipos de objetos públicos (props, estados).
- Usar `type` para uniones, intersecciones y aliases simples.
- Evitar `any`; preferir tipos genéricos o `unknown`.
- Activar `strict: true` (ya configurado en `tsconfig.json`).

### React / React Native

- Un componente por archivo.
- Exportar componentes con nombre (no exports default anónimos).
- Props tipadas con interface `<ComponentName>Props`.
- Añadir JSDoc en el componente y en la interface de props.

### NativeWind / Tailwind

- Usar los tokens `luki-*` para colores de la marca.
- No usar estilos inline (`style={{}}`) cuando exista clase Tailwind equivalente.
- Para lógica de clases condicionales, usar `clsx` + `tailwind-merge`.

### Nomenclatura

| Elemento | Convención | Ejemplo |
|---|---|---|
| Componentes | PascalCase | `MediaRow`, `HeroCard` |
| Hooks | camelCase con `use` | `useAuthStore` |
| Archivos de componente | PascalCase.tsx | `Button.tsx` |
| Archivos de pantalla | camelCase.tsx | `home.tsx` |
| Constantes de módulo | UPPER_SNAKE | `ADMIN_PASS`, `TAG_ORDER` |

---

## Estructura de commits por área

```
app/          → screens y layouts
components/   → UI components
services/     → Zustand stores
docs/         → documentación
scripts/      → automatización
tests/        → pruebas
```

---

## Reportar un bug

Abre un issue con la plantilla correspondiente e incluye:

1. Descripción clara del comportamiento inesperado.
2. Pasos para reproducirlo.
3. Comportamiento esperado vs. actual.
4. Plataforma (iOS / Android / Web) y versión de la app.
5. Logs relevantes o capturas de pantalla.

---

## Proponer una funcionalidad

Abre un issue con el tipo `feat` e incluye:

1. Descripción del problema que resuelve.
2. Solución propuesta con ejemplos si es posible.
3. Alternativas consideradas.

---

## Preguntas

Para dudas generales, abre una discusión en la pestaña **Discussions** del repositorio.
