// src/layouts/PublicLayout.tsx
import { Link, Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <>
      <header className="site-header">
        <nav aria-label="Main">
          <Link to="/">Home</Link> <Link to="/request">Request care</Link>{' '}
          <Link to="/status">Check a request</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </>
  )
}
