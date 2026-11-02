// src/layouts/StaffLayout.tsx
import { Link, NavLink, Outlet } from 'react-router-dom'
import { Button } from '../components/Button'
import { supabase } from '../utils/supabase'

export default function StaffLayout() {
  return (
    // display: contents keeps header/main as direct flex children of #root, so the page frame still works
    <div className="layout--wide">
      <header className="site-header">
        <nav aria-label="Staff">
          <Link to="/staff" className="brand">
            <span className="brand__name">Zion Church</span>
            <span className="brand__sub">Care Team</span>
          </Link>
          <NavLink to="/staff" end className="nav-link push-end">Open Requests</NavLink>
          <NavLink to="/staff/archived" className="nav-link">Archived</NavLink>
          {/* RequireStaff sees the session end and sends the user to the login page */}
          <Button variant="outline" onClick={() => supabase.auth.signOut()}>Sign Out</Button>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
