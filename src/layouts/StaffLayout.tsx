import { NavLink, Outlet } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function StaffLayout() {
  return (
    <>
      <header>
        <nav aria-label="Staff">
          <NavLink to="/staff" end>Open requests</NavLink>{' '}
          <NavLink to="/staff/archived">Archived</NavLink>{' '}
          <button type="button" onClick={() => supabase.auth.signOut()}>Sign out</button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
