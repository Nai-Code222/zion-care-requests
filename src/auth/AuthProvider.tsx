

// src/auth/AuthProvider.tsx
import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'
import { AuthContext } from './AuthContext'

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  // Which user the staff check ran for, so a stale result is never trusted
  const [staffCheck, setStaffCheck] = useState<{ userId: string; isStaff: boolean } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoaded(true)
    })
    // Keep this callback synchronous: awaiting Supabase calls inside it can deadlock the client
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => subscription.unsubscribe()
  }, [])

  const userId = session?.user.id

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    supabase
      .from('staff')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) setStaffCheck({ userId, isStaff: !!data })
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  const staffChecked = !userId || staffCheck?.userId === userId
  const isStaff = !!userId && staffCheck?.userId === userId && staffCheck.isStaff

  return (
    <AuthContext.Provider value={{ session, isStaff, loading: !sessionLoaded || !staffChecked }}>
      {children}
    </AuthContext.Provider>
  )
}
