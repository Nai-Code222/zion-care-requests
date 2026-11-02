// src/pages/StaffLoginPage.tsx
import { useState, type SubmitEvent } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Button } from '../components/Button'
import Field from '../components/Field'
import { supabase } from '../utils/supabase'

export default function StaffLoginPage() {
  const { session, isStaff, loading } = useAuth()
  const location = useLocation()
  const [error, setError] = useState<string>()
  const [signingIn, setSigningIn] = useState(false)

  // RequireStaff sends people here with the page they were trying to open
  const from = (location.state as { from?: string } | null)?.from ?? '/staff'

  // Signed in already (or just now, once AuthProvider has checked the staff table): go on
  if (!loading && session && isStaff) return <Navigate to={from} replace />

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (signingIn) return
    const form = new FormData(event.currentTarget)
    const email = String(form.get('email') ?? '').trim()
    const password = String(form.get('password') ?? '')
    if (!email || !password) {
      setError('Enter your email and password.')
      return
    }

    setError(undefined)
    setSigningIn(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setSigningIn(false)
    // Same message for a wrong email or a wrong password, so the form doesn't reveal which accounts exist
    if (signInError) setError("That email and password don't match a care team account.")
  }

  // Signed in, but the account isn't in the staff table
  const notStaff = !loading && session && !isStaff

  return (
    <div className="status-page">
      <section className="stack status-intro" aria-labelledby="login-title">
        <h1 id="login-title" className="page-title">Care team sign in</h1>
        <p className="lead">For Zion care team staff. Members don't need an account.</p>
      </section>

      <form
        className="card card--lg stack status-form"
        onSubmit={handleSubmit}
        aria-labelledby="login-title"
        aria-busy={signingIn || undefined}
        noValidate
      >
        <Field label="Email">
          {(control) => <input {...control} name="email" type="email" autoComplete="username" required />}
        </Field>
        <Field label="Password">
          {(control) => (
            <input {...control} name="password" type="password" autoComplete="current-password" required />
          )}
        </Field>
        <Button type="submit" size="lg" block disabled={signingIn}>
          {signingIn ? 'Signing in…' : 'Sign In'}
        </Button>
        <div role="alert" aria-live="polite" className="stack status-messages">
          {error && <p className="callout">{error}</p>}
          {notStaff && (
            <p className="callout">
              This account doesn't have care team access.{' '}
              <button type="button" className="link-button" onClick={() => supabase.auth.signOut()}>
                Sign out
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  )
}
