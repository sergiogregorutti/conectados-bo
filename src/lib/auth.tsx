import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { AuthContextType, UserRole } from '@/types/auth'

const AuthContext = createContext<AuthContextType | null>(null)

function readTokenPayload(session: Session | null): Record<string, unknown> | null {
  if (!session?.access_token) return null
  try {
    const base64 = session.access_token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function getRoleFromToken(session: Session | null): UserRole | null {
  const payload = readTokenPayload(session) as { app_metadata?: { role?: string } } | null
  if (payload?.app_metadata?.role === 'admin') return 'ADMIN'
  return null
}

// 'aal2' = la sesión pasó el segundo factor (TOTP). La API exige aal2 en
// /api/admin (informe de seguridad 26/11/2026, S12); acá solo decide a qué
// pantalla mandar al admin, el control real es el de la API.
function isMfaVerifiedToken(session: Session | null): boolean {
  return readTokenPayload(session)?.aal === 'aal2'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [role, setRole] = useState<UserRole | null>(null)
  const [isMfaVerified, setIsMfaVerified] = useState(false)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setRole(getRoleFromToken(session))
      setIsMfaVerified(isMfaVerifiedToken(session))
      setIsLoading(false)
    })

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setRole(getRoleFromToken(session))
      setIsMfaVerified(isMfaVerifiedToken(session))
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    const tokenRole = getRoleFromToken(data.session)
    return { error: error as Error | null, isAdmin: tokenRole === 'ADMIN' }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!session,
    role,
    isAdmin: role === 'ADMIN',
    isMfaVerified,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
