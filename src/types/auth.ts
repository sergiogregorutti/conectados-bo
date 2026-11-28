import type { User, Session } from '@supabase/supabase-js'

export type UserRole = 'ADMIN' | 'USER'

export interface AuthState {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  role: UserRole | null
  isAdmin: boolean
  // La sesión pasó el segundo factor (aal2).
  isMfaVerified: boolean
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null; isAdmin: boolean }>
  signOut: () => Promise<void>
}
