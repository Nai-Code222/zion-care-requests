// src/layouts/PublicLayout.tsx
import { Link, Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <>
      <header className="site-header">
        <nav aria-label="Main">
          <Link to="/" className="brand">
            <span className="brand__name">Zion Church</span>
            <span className="brand__sub">Care</span>
          </Link>
          <Link to="/status" className="nav-link push-end">Check a Request</Link>
           <Link to="/staff/login" className="nav-link">Care team Login</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <p>
          Zion Church · Greenbelt · Landover · Fort Washington · Woodbridge
        </p>
      </footer>
    </>
  )
}
