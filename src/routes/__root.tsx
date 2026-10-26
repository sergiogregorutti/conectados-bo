import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import type { AuthContextType } from '@/types/auth'

interface RouterContext {
  auth: AuthContextType
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: () => (
    <>
      <Outlet />
      <Toaster theme="dark" richColors position="top-right" />
      <TanStackRouterDevtools />
    </>
  ),
})
