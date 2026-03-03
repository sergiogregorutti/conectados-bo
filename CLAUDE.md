# Admin Backoffice - CLAUDE.md

## Contexto

Backoffice SPA (herramienta interna) para gestionar la aplicación Conectados.

**Nota**: La carpeta `admin/` dentro de `conectados-api` es temporal para mantener contexto durante el desarrollo. Este proyecto será un **repositorio independiente** (`conectados-admin` o similar).

---

## Decisiones Tomadas

| Tema | Decisión | Notas |
|------|----------|-------|
| Tipo de proyecto | Herramienta interna | Priorizar velocidad de desarrollo |
| UI Library | shadcn/ui | Radix + Tailwind |
| Router | TanStack Router | Mejor DX con tipos |
| Server State | TanStack Query v5 | React Query |
| Forms | React Hook Form + Zod | - |
| HTTP Client | Axios | Instancia configurada |
| Build Tool | Vite | - |

---

## Stack

```
Vite + React 18 + TypeScript
├── TanStack Query v5
├── TanStack Router
├── shadcn/ui (Radix + Tailwind)
├── React Hook Form + Zod
└── Axios
```

---

## Arquitectura

### Data Flow

```
View → useX Hook → Service → API → Cache (TanStack Query) → View
```

### Estructura de Carpetas

```
src/
├── components/        # shadcn/ui + componentes compartidos
│   └── ui/            # Componentes de shadcn
├── lib/               # Configuración (axios, queryClient, utils)
├── hooks/             # Hooks globales reutilizables
├── services/          # Funciones de API (objeto con métodos, NO clases)
│   └── ads.ts
├── types/             # TypeScript types
├── routes/            # TanStack Router file-based routes
│   ├── __root.tsx
│   ├── index.tsx
│   └── ads/
│       ├── index.tsx
│       └── $adId.tsx
└── main.tsx
```

### Reglas

1. **Services**: Objetos con funciones puras, NO clases
2. **Hooks**: Un hook por view que expone query + mutations
3. **Componentes**: Archivo único hasta que crezca, entonces carpeta
4. **Colocación**: Empezar local en la view, mover a global si se reutiliza
5. **Tests**: Solo en lógica crítica, no en cada componente UI

### Convenciones

- **Event Handlers**: `onVerboNombre` (onDeleteAd, onCreateAd)
- **Booleans**: `is/has/should` (isLoading, hasError)
- **Queries**: `useAds`, `useAd(id)`
- **Services**: `adsService.getAll()`, `adsService.create(data)`

---

## Contexto de la App

App tipo Tinder (swipe-based dating app). Los ads se muestran **cada X swipes** al usuario.

---

## Funcionalidades

### Gestión de Ads

**Modelo Ad:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| title | string | Nombre interno del ad |
| type | enum | `banner` \| `interstitial` |
| mediaType | enum | `image` \| `video` |
| mediaUrl | string | URL del asset (Supabase Storage) |
| destinationUrl | string | URL web al hacer click |
| startsAt | datetime | Fecha/hora de inicio |
| endsAt | datetime | Fecha/hora de fin |
| isActive | boolean | Activo/inactivo manual |
| priority | int | Peso para ordenar (mayor = más prioridad) |
| swipeFrequency | int | Mostrar cada X swipes |
| impressions | int | Contador de impresiones |
| clicks | int | Contador de clicks |
| createdAt | datetime | - |
| updatedAt | datetime | - |

**Tipos de Ad:**
- **Banner**: Se muestra en el stack de cards durante el swipe
- **Interstitial**: Pantalla completa que aparece cada X swipes

**Lógica de visualización:**
- Cada ad tiene su `swipeFrequency` (cada cuántos swipes aparece)
- Si hay múltiples ads activos, se ordenan por `priority` (mayor primero)
- No siempre habrá ads activos (app pequeña/partidaria)

**Media:**
- Upload desde admin vía API
- Storage: Supabase Storage

**CRUD Backoffice:**
- [ ] Listar ads (tabla con filtros por tipo, estado, fechas)
- [ ] Crear ad (form + upload media)
- [ ] Editar ad
- [ ] Eliminar ad
- [ ] Activar/desactivar ad
- [ ] Ver métricas (impresiones, clicks, CTR)

---

## Decisiones de Negocio

| Tema | Decisión |
|------|----------|
| Segmentación | Solo por frecuencia de swipes (configurable por ad) |
| Frecuencia | Cada X swipes, configurable por ad (`swipeFrequency`) |
| Prioridad | Por peso (`priority`), mayor número = más prioridad |
| Media upload | Admin → API → Supabase Storage |
| Disponibilidad | No siempre habrá ads activos |

---

## API Endpoints Necesarios (Backend)

```
GET    /api/admin/ads         # Listar ads
POST   /api/admin/ads         # Crear ad
GET    /api/admin/ads/:id     # Obtener ad
PATCH  /api/admin/ads/:id     # Actualizar ad
DELETE /api/admin/ads/:id     # Eliminar ad
POST   /api/admin/ads/:id/toggle  # Activar/desactivar
```

---

## Autenticación

### Flujo

```
Login → Supabase Auth → JWT Token → Axios Interceptor → API Request
```

### Archivos clave

- `lib/supabase.ts` - Cliente Supabase configurado
- `lib/auth.tsx` - AuthContext con signIn/signOut y estado de sesión
- `lib/axios.ts` - Interceptors para agregar token y manejar 401

### Protección de rutas

TanStack Router usa `beforeLoad` para verificar autenticación:

```tsx
beforeLoad: ({ context }) => {
  if (!context.auth.isAuthenticated) {
    throw redirect({ to: '/' })
  }
}
```

### Variables de entorno

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=http://localhost:3000/api
```

---

## Estado del Desarrollo

### Completado

- [x] Setup Vite + React + TypeScript
- [x] Tailwind + shadcn/ui
- [x] TanStack Router (file-based)
- [x] TanStack Query
- [x] Supabase Auth integrado
- [x] Axios con interceptors
- [x] Login funcional
- [x] Rutas protegidas
- [x] Design system dark mode (colores de la marca)
- [x] Layout del dashboard con sidebar (shadcn Sidebar)
- [x] Navegación a Dashboard y Ads
- [x] CRUD completo de Ads (con mocks)
  - [x] Tipos (`types/ad.ts`)
  - [x] Service con mocks (`services/ads.ts`)
  - [x] Hooks React Query (`hooks/useAds.ts`)
  - [x] Listado con tabla y filtros
  - [x] Crear/Editar ad con formulario
  - [x] Eliminar ad con confirmación
  - [x] Toggle activo/inactivo
- [x] Endpoints documentados en `API_SPEC.md`

### Siguiente paso

- [ ] Conectar con API real (descomentar llamadas en `services/ads.ts`)
- [ ] Upload de media a Supabase Storage
- [ ] Implementar endpoints en conectados-api

---

## Comandos

```bash
npm install          # Instalar dependencias
npm run dev          # Dev server (Vite)
npm run build        # Build para producción
npm run preview      # Preview del build
```
