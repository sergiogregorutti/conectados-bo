import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    // Si no está autenticado, redirigir al login
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: Dashboard,
})

function Dashboard() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  const onSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <header className="border-b bg-background">
        <div className="flex h-16 items-center justify-between px-6">
          <h1 className="text-xl font-semibold">Conectados Admin</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={onSignOut}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>
      <main className="p-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
      </main>
    </div>
  )
}
