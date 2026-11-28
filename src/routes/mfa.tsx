import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

// Segundo factor obligatorio para admins (informe de seguridad 26/11/2026, S12).
//
// - Sin factor verificado: se enrola un TOTP (QR para Google Authenticator,
//   1Password, Authy…) y se confirma con el primer código.
// - Con factor verificado: se pide el código de 6 dígitos.
//
// Al verificar, Supabase emite una sesión aal2 (evento MFA_CHALLENGE_VERIFIED),
// AuthProvider la toma y el efecto de abajo manda al dashboard.
export const Route = createFileRoute('/mfa')({
  beforeLoad: ({ context }) => {
    if (context.auth.isLoading) return
    if (!context.auth.isAuthenticated || !context.auth.isAdmin) {
      throw redirect({ to: '/' })
    }
    if (context.auth.isMfaVerified) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: Mfa,
})

type Mode =
  | { kind: 'loading' }
  | { kind: 'enroll'; factorId: string; qrCode: string; secret: string }
  | { kind: 'verify'; factorId: string }
  | { kind: 'error'; message: string }

function Mfa() {
  const navigate = useNavigate()
  const { isLoading: isAuthLoading, isAuthenticated, isAdmin, isMfaVerified, signOut } =
    useAuth()
  const [mode, setMode] = useState<Mode>({ kind: 'loading' })
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // StrictMode monta dos veces en dev: sin esto se enrolarían dos factores.
  const hasStarted = useRef(false)

  useEffect(() => {
    if (isAuthLoading) return
    if (!isAuthenticated || !isAdmin) {
      navigate({ to: '/' })
    } else if (isMfaVerified) {
      navigate({ to: '/dashboard' })
    }
  }, [isAuthLoading, isAuthenticated, isAdmin, isMfaVerified, navigate])

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || !isAdmin || isMfaVerified) return
    if (hasStarted.current) return
    hasStarted.current = true

    const start = async () => {
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors()
      if (listError) {
        setMode({ kind: 'error', message: listError.message })
        return
      }

      const verified = factors.totp[0]
      if (verified) {
        setMode({ kind: 'verify', factorId: verified.id })
        return
      }

      // Restos de un enrolamiento que no se terminó (se cerró la pestaña antes
      // de poner el código): se borran para no acumularlos.
      const unverified = factors.all.filter(
        (f) => f.factor_type === 'totp' && f.status === 'unverified'
      )
      for (const f of unverified) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }

      const { data, error: enrollError } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Backoffice ${new Date().toISOString().slice(0, 16)}`,
      })
      if (enrollError) {
        setMode({ kind: 'error', message: enrollError.message })
        return
      }
      setMode({
        kind: 'enroll',
        factorId: data.id,
        qrCode: data.totp.qr_code,
        secret: data.totp.secret,
      })
    }

    start().catch((e: unknown) =>
      setMode({ kind: 'error', message: e instanceof Error ? e.message : 'Error inesperado' })
    )
  }, [isAuthLoading, isAuthenticated, isAdmin, isMfaVerified])

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mode.kind !== 'enroll' && mode.kind !== 'verify') return
    setError(null)
    setIsSubmitting(true)

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: mode.factorId,
      code: code.trim(),
    })

    if (verifyError) {
      setError('Código incorrecto o vencido. Probá con el código actual de la app.')
      setCode('')
      setIsSubmitting(false)
      return
    }
    // La navegación la hace el efecto cuando llega la sesión aal2.
  }

  const onSignOut = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Verificación en dos pasos</CardTitle>
          <CardDescription>
            {mode.kind === 'enroll'
              ? 'Escaneá el código con tu app de autenticación (Google Authenticator, 1Password, Authy…) y escribí el código de 6 dígitos.'
              : 'Escribí el código de 6 dígitos de tu app de autenticación.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode.kind === 'loading' && <p className="text-muted-foreground">Cargando...</p>}

          {mode.kind === 'error' && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              No se pudo iniciar la verificación: {mode.message}
            </div>
          )}

          {mode.kind === 'enroll' && (
            <div className="space-y-2">
              <img
                src={mode.qrCode}
                alt="Código QR para la app de autenticación"
                className="mx-auto h-48 w-48 rounded-md bg-white p-2"
              />
              <p className="text-center text-xs text-muted-foreground">
                ¿No podés escanearlo? Cargá esta clave a mano:
              </p>
              <p className="break-all text-center font-mono text-xs">{mode.secret}</p>
            </div>
          )}

          {(mode.kind === 'enroll' || mode.kind === 'verify') && (
            <form method="post" onSubmit={onSubmit} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="code">Código</Label>
                <Input
                  id="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isSubmitting}
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || code.length !== 6}>
                {isSubmitting ? 'Verificando...' : 'Verificar'}
              </Button>
            </form>
          )}

          <Button variant="ghost" className="w-full" onClick={onSignOut}>
            Cerrar sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
