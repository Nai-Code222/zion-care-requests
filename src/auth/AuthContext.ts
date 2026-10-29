// src/auth/AuthContext.ts
import { createContext, useContext } from 'react'
import type { Session } from '@supabase/supabase-js'

export type AuthState = {
  session: Session | null
  isStaff: boolean
  loading: boolean
}

export const AuthContext = createContext<AuthState>({ session: null, isStaff: false, loading: true })

export function useAuth() {
  return useContext(AuthContext)
}
