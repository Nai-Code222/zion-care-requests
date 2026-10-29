

// src/auth/RequireStaff.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireStaff() {
  const { session, isStaff, loading } = useAuth()
  const location = useLocation()

  if (loading) return <p>Loading…</p>
  if (!session) return <Navigate to="/staff/login" replace state={{ from: location.pathname }} />
  if (!isStaff) return <p role="alert">This account doesn't have staff access.</p>
  return <Outlet />
}
