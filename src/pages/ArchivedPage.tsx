// src/pages/ArchivedPage.tsx
import { useEffect, useState } from 'react'
import RequestList from '../components/RequestList'
import { getArchivedRequests, type RequestSummary } from '../services/staffRequests'

export default function ArchivedPage() {
  const [requests, setRequests] = useState<RequestSummary[]>()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    getArchivedRequests().then(setRequests, () => setFailed(true))
  }, [])

  return (
    <div className="stack staff-page">
      <div className="stack staff-page__intro">
        <h1 className="page-title">Archived requests</h1>
        <p className="muted">
          Completed requests are kept here, never deleted. Open one to read its history or reopen it.
        </p>
      </div>

      {failed ? (
        <p role="alert" className="callout">Couldn't load archived requests. Refresh the page to try again.</p>
      ) : !requests ? (
        <p role="status">Loading archived requests…</p>
      ) : requests.length === 0 ? (
        <p className="card">No completed requests yet.</p>
      ) : (
        <RequestList requests={requests} archived />
      )}
    </div>
  )
}
