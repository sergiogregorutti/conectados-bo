# Conectados Admin

Backoffice SPA para gestionar la aplicación Conectados.

## Stack

- **Framework**: Vite + React 18 + TypeScript
- **Router**: TanStack Router (file-based routing)
- **Server State**: TanStack Query v5
- **UI**: shadcn/ui (Radix + Tailwind)
- **Auth**: Supabase Auth
- **HTTP Client**: Axios

## Setup

```bash
# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env

# Configurar las variables en .env:
# - VITE_SUPABASE_URL
# - VITE_SUPABASE_ANON_KEY
# - VITE_API_URL

# Iniciar dev server
npm run dev
```

## Estructura

```
src/
├── components/
│   ├── ads/
│   │   └── AdForm.tsx      # Formulario crear/editar ad
│   ├── layout/
│   │   └── AppSidebar.tsx  # Sidebar con navegación
│   └── ui/                 # Componentes shadcn
├── hooks/
│   └── useAds.ts           # React Query hooks para ads
├── lib/
│   ├── auth.tsx            # AuthContext y useAuth
│   ├── axios.ts            # Instancia axios con interceptors
│   ├── queryClient.ts      # React Query client
│   ├── supabase.ts         # Cliente Supabase
│   └── utils.ts            # cn() helper
├── routes/
│   ├── __root.tsx          # Root layout
│   ├── index.tsx           # Login (/)
│   ├── dashboard.tsx       # Dashboard layout con sidebar
│   └── dashboard/
│       ├── index.tsx       # Dashboard home (/dashboard)
│       └── ads/
│           ├── index.tsx   # Listado de ads
│           ├── new.tsx     # Crear ad
│           └── $adId.tsx   # Editar ad
├── services/
│   └── ads.ts              # Service con mocks (endpoints documentados)
├── types/
│   ├── ad.ts               # Tipos de Ad
│   └── auth.ts             # Tipos de autenticación
└── main.tsx                # Entry point + providers
```

## Flujo de Autenticación

1. Usuario ingresa credenciales en `/`
2. `signIn()` llama a `supabase.auth.signInWithPassword()`
3. Supabase retorna JWT token y sesión
4. AuthContext guarda la sesión
5. Axios interceptor agrega `Authorization: Bearer <token>` a cada request
6. Rutas protegidas verifican `context.auth.isAuthenticated` en `beforeLoad`

## Comandos

```bash
npm run dev      # Dev server
npm run build    # Build producción
npm run preview  # Preview del build
npm run lint     # ESLint
```

## Variables de Entorno

| Variable | Descripción |
|----------|-------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase |
| `VITE_SUPABASE_ANON_KEY` | Clave pública de Supabase |
| `VITE_API_URL` | URL base del API (ej: `http://localhost:3000/api`) |

## Notas

- El API usa el mismo Supabase para auth, el token JWT es válido en ambos
- Las rutas usan `beforeLoad` de TanStack Router para protección
- El interceptor de axios maneja 401 automáticamente (logout + redirect)
