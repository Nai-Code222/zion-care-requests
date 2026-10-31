// src/layouts/RootLayout.tsx
import { Outlet, ScrollRestoration } from 'react-router-dom'

/**
 * Wraps every route. ScrollRestoration starts each new page at the top,
 * and returns to the previous position on Back/Forward.
 */
export default function RootLayout() {
  return (
    <>
      <Outlet />
      <ScrollRestoration />
    </>
  )
}
