// src/router.tsx
import { createBrowserRouter } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import StaffLayout from './layouts/StaffLayout'
import RequireStaff from './auth/RequireStaff'
import HomePage from './pages/HomePage'
import SubmitRequestPage from './pages/SubmitRequestPage'
import SubmittedPage from './pages/SubmittedPage'
import StatusLookupPage from './pages/StatusLookupPage'
import StaffLoginPage from './pages/StaffLoginPage'
import StaffDashboardPage from './pages/StaffDashboardPage'
import ArchivedPage from './pages/ArchivedPage'
import RequestDetailPage from './pages/RequestDetailPage'
import NotFoundPage from './pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'request', element: <SubmitRequestPage /> },
      { path: 'request/submitted', element: <SubmittedPage /> },
      { path: 'status', element: <StatusLookupPage /> },
      { path: 'staff/login', element: <StaffLoginPage /> },
    ],
  },
  {
    path: 'staff',
    element: <RequireStaff />,
    children: [
      {
        element: <StaffLayout />,
        children: [
          { index: true, element: <StaffDashboardPage /> },
          { path: 'archived', element: <ArchivedPage /> },
          { path: 'requests/:id', element: <RequestDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
])
