// src/pages/StaffDashboardPage.tsx
import { useEffect, useMemo, useState } from 'react'
import Field from '../components/Field'
import RequestList from '../components/RequestList'
import { getOpenRequests, type RequestSummary } from '../services/staffRequests'

type Sort = 'urgency' | 'newest' | 'oldest'

const sortLabels: Record<Sort, string> = {
  urgency: 'Most urgent first',
  newest: 'Newest first',
  oldest: 'Oldest first',
}

const byDate = (a: RequestSummary, b: RequestSummary) => a.created_at.localeCompare(b.created_at)

// Urgency sorts by urgency_rank from the database (Urgent 3, Soon 2, Routine 1), never by the label,
// which would put Routine before Urgent. Within one urgency, the request waiting longest comes first.
const sorters: Record<Sort, (a: RequestSummary, b: RequestSummary) => number> = {
  urgency: (a, b) => b.urgency_type.urgency_rank - a.urgency_type.urgency_rank || byDate(a, b),
  newest: (a, b) => byDate(b, a),
  oldest: byDate,
}

export default function StaffDashboardPage() {
  const [requests, setRequests] = useState<RequestSummary[]>()
  const [failed, setFailed] = useState(false)
  const [sort, setSort] = useState<Sort>('urgency')

  useEffect(() => {
    getOpenRequests().then(setRequests, () => setFailed(true))
  }, [])

  const sorted = useMemo(() => requests && [...requests].sort(sorters[sort]), [requests, sort])

  return (
    <div className="stack staff-page">
      <div className="staff-page__header">
        <div className="stack staff-page__intro">
          <h1 className="page-title">Open requests</h1>
          {sorted && (
            <p className="muted">{sorted.length === 1 ? '1 request' : `${sorted.length} requests`} not yet completed</p>
          )}
        </div>
        <div className="staff-sort">
          <Field label="Sort by">
            {(control) => (
              <select {...control} value={sort} onChange={(event) => setSort(event.target.value as Sort)}>
                {(Object.keys(sortLabels) as Sort[]).map((value) => (
                  <option key={value} value={value}>{sortLabels[value]}</option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </div>

      {failed ? (
        <p role="alert" className="callout">Couldn't load requests. Refresh the page to try again.</p>
      ) : !sorted ? (
        <p role="status">Loading requests…</p>
      ) : sorted.length === 0 ? (
        <p className="card">No open requests right now.</p>
      ) : (
        <RequestList requests={sorted} />
      )}
    </div>
  )
}
