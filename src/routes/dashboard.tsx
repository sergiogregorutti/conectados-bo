import { createFileRoute, redirect, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    // Si aún está cargando, no redirigir - dejar que el componente maneje el loading
    if (context.auth.isLoading) {
      return
    }
    // Debe estar autenticado Y ser admin
    if (!context.auth.isAuthenticated || !context.auth.isAdmin) {
      throw redirect({ to: '/' })
    }
    // Admin sin segundo factor: la API rechazaría todo con MFA_REQUIRED.
    if (!context.auth.isMfaVerified) {
      throw redirect({ to: '/mfa' })
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  const { isLoading, isAuthenticated, isAdmin, isMfaVerified } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated || !isAdmin) {
      navigate({ to: '/' })
    } else if (!isMfaVerified) {
      navigate({ to: '/mfa' })
    }
  }, [isLoading, isAuthenticated, isAdmin, isMfaVerified, navigate])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Cargando...</div>
      </div>
    )
  }

  if (!isAuthenticated || !isAdmin || !isMfaVerified) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="h-4" />
          <span className="text-sm text-muted-foreground">Admin</span>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
