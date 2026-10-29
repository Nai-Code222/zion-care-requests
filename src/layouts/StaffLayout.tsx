import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function StaffLayout() {
  return (
    <>
      <header className="site-header">
        <nav aria-label="Staff">
          <NavLink to="/staff" end>Open requests</NavLink>{' '}
          <NavLink to="/staff/archived">Archived</NavLink>{' '}
          <button type="button" className="push-end" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
