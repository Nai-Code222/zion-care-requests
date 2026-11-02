// src/components/RequestList.tsx
import { Link } from 'react-router-dom'
import { requesterName, type RequestSummary } from '../services/staffRequests'
import DateTime from './DateTime'
import UrgencyBadge from './UrgencyBadge'

type Props = {
  requests: RequestSummary[]
  /** Archived lists show when each request was completed instead of its current status. */
  archived?: boolean
}

/** Requests as a table on wide screens; each row becomes a stacked card on narrow ones (see staff.css). */
export default function RequestList({ requests, archived }: Props) {
  return (
    <table className="request-table">
      <thead>
        <tr>
          <th scope="col">Reference</th>
          <th scope="col">Urgency</th>
          <th scope="col">Type</th>
          <th scope="col">Member</th>
          <th scope="col">{archived ? 'Completed' : 'Status'}</th>
          <th scope="col">Received</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
          <tr key={request.reference_code}>
            {/* data-label: the column name, shown beside each value when rows stack as cards */}
            <td data-label="Reference">
              <Link to={`/staff/requests/${request.reference_code}`} className="strong-link ref-code">
                {request.reference_code}
              </Link>
            </td>
            <td data-label="Urgency"><UrgencyBadge urgency={request.urgency_type.urgency} /></td>
            <td data-label="Type">{request.request_type.request_type}</td>
            <td data-label="Member">{requesterName(request)}</td>
            <td data-label={archived ? 'Completed' : 'Status'}>
              {archived && request.archived_at
                ? <DateTime value={request.archived_at} dateOnly />
                : request.status_types.status_type}
            </td>
            <td data-label="Received"><DateTime value={request.created_at} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
