import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/lib/auth'
import { queryClient } from '@/lib/queryClient'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import './index.css'
import { routeTree } from './routeTree.gen'

// Si un chunk falla al cargar (deploy nuevo con bundle viejo en caché,
// extensión del navegador bloqueando la request, etc.) Vite emite este evento
// en vez de dejar la promesa colgada. Recargamos para traer la versión actual.
window.addEventListener('vite:preloadError', () => {
  window.location.reload()
})

const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // Se inyecta en InnerApp
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <InnerApp />
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
