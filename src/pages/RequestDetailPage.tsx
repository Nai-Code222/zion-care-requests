// src/pages/RequestDetailPage.tsx
import { useCallback, useEffect, useRef, useState, type SubmitEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button } from '../components/Button'
import DateTime from '../components/DateTime'
import Field from '../components/Field'
import UrgencyBadge from '../components/UrgencyBadge'
import { getStatusTypes, type StatusType } from '../services/lookup'
import {
  addRequestUpdate,
  getRequestDetail,
  requesterName,
  type HistoryEntry,
  type RequestDetail,
} from '../services/staffRequests'

// The archive trigger is wired to this ID (see docs/database.md), so the button uses it too
const COMPLETED_STATUS_ID = 4
// Matches the 250-character check on activity_log.internal_notes; member messages use the same limit
const NOTE_MAX = 250

type LoadState =
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error' }
  | { kind: 'found'; request: RequestDetail; history: HistoryEntry[] }

export default function RequestDetailPage() {
  const { id: code = '' } = useParams()
  const [state, setState] = useState<LoadState>({ kind: 'loading' })
  const [statusTypes, setStatusTypes] = useState<StatusType[]>([])
  const [savedMessage, setSavedMessage] = useState('')

  const load = useCallback(
    () =>
      getRequestDetail(code).then(
        (result) => setState(result ? { kind: 'found', ...result } : { kind: 'notFound' }),
        () => setState({ kind: 'error' }),
      ),
    [code],
  )

  useEffect(() => {
    let cancelled = false
    getRequestDetail(code).then(
      (result) => !cancelled && setState(result ? { kind: 'found', ...result } : { kind: 'notFound' }),
      () => !cancelled && setState({ kind: 'error' }),
    )
    // Moving to another request before this one loads mustn't show the old one
    return () => {
      cancelled = true
    }
  }, [code])

  useEffect(() => {
    getStatusTypes().then(setStatusTypes, () => setStatusTypes([]))
  }, [])

  if (state.kind === 'loading') return <p role="status">Loading request…</p>
  if (state.kind === 'notFound' || state.kind === 'error') {
    return (
      <div className="stack staff-page">
        <BackLink />
        <p role="alert" className="callout">
          {state.kind === 'notFound'
            ? `No request has the reference code ${code}.`
            : "Couldn't load this request. Refresh the page to try again."}
        </p>
      </div>
    )
  }

  const { request, history } = state

  return (
    <div className="stack staff-page">
      <BackLink archived={request.archived_flag} />

      <div className="stack staff-page__intro">
        <p className="eyebrow ref-code">{request.reference_code}</p>
        <h1 className="page-title">{request.request_type.request_type}</h1>
        <p className="detail-tags">
          <UrgencyBadge urgency={request.urgency_type.urgency} />
          <span className="detail-status">{request.status_types.status_type}</span>
          {request.archived_flag && request.archived_at && (
            <span className="muted">Archived <DateTime value={request.archived_at} dateOnly /></span>
          )}
        </p>
      </div>

      {/* Announces each saved update; stays in the page so screen readers notice the change */}
      <div role="status" aria-live="polite">
        {savedMessage && <p className="callout detail-saved">{savedMessage}</p>}
      </div>

      <div className="detail-layout">
        <div className="stack">
          <RequestInfo request={request} />
          <History history={history} />
        </div>
        {/* Remounts after each save (updated_at changes), so the form resets to the new status */}
        <UpdateForm
          key={request.updated_at + history.length}
          code={request.reference_code}
          currentStatusId={request.status_types.status_type_id}
          statusTypes={statusTypes}
          onSaved={async (message) => {
            await load()
            setSavedMessage(message)
          }}
        />
      </div>
    </div>
  )
}

function BackLink({ archived }: { archived?: boolean }) {
  return (
    <p>
      <Link to={archived ? '/staff/archived' : '/staff'} className="strong-link">
        ← Back to {archived ? 'archived' : 'open'} requests
      </Link>
    </p>
  )
}

function RequestInfo({ request }: { request: RequestDetail }) {
  const contact = request.no_contact_flag
    ? "Doesn't want to be contacted"
    : [request.contact_method_types.contact_method, request.phone ?? request.email].filter(Boolean).join(': ')

  return (
    <section className="card stack" aria-labelledby="detail-info-title">
      <h2 id="detail-info-title" className="card__title">Request</h2>
      <dl className="status-facts">
        <div>
          <dt>Member</dt>
          <dd>{requesterName(request)}</dd>
        </div>
        <div>
          <dt>Contact</dt>
          <dd>{contact}</dd>
        </div>
        <div>
          <dt>Received</dt>
          <dd><DateTime value={request.created_at} /></dd>
        </div>
        <div>
          <dt>Last updated</dt>
          <dd><DateTime value={request.updated_at} /></dd>
        </div>
      </dl>
      <div className="stack detail-notes">
        <h3 className="detail-label">What's on their heart</h3>
        <p className="status-notes__text">{request.member_notes}</p>
      </div>
    </section>
  )
}

function History({ history }: { history: HistoryEntry[] }) {
  return (
    <section className="card stack" aria-labelledby="detail-history-title">
      <h2 id="detail-history-title" className="card__title">History</h2>
      {history.length === 0 ? (
        <p className="muted">No updates yet.</p>
      ) : (
        // Newest first, as historyQuery orders them
        <ol className="list-reset status-updates" role="list">
          {history.map((entry) => (
            <li key={entry.activity_log_id} className="status-update">
              <p className="status-update__change">
                {entry.old_status_id === entry.new_status_id
                  ? entry.new_status.status_type
                  : `${entry.old_status.status_type} → ${entry.new_status.status_type}`}
              </p>
              <p className="muted status-update__time"><DateTime value={entry.timestamp} /></p>
              {entry.member_message && (
                <p><span className="detail-label">To member:</span> {entry.member_message}</p>
              )}
              {entry.internal_notes && (
                <p className="detail-internal"><span className="detail-label">Internal:</span> {entry.internal_notes}</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

type UpdateFormProps = {
  code: string
  currentStatusId: number
  statusTypes: StatusType[]
  onSaved: (message: string) => Promise<void>
}

function UpdateForm({ code, currentStatusId, statusTypes, onSaved }: UpdateFormProps) {
  const [statusId, setStatusId] = useState(currentStatusId)
  const [memberMessage, setMemberMessage] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [error, setError] = useState<string>()
  const [saving, setSaving] = useState(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  const isCompleted = currentStatusId === COMPLETED_STATUS_ID

  async function save(nextStatusId: number) {
    if (saving) return
    if (nextStatusId === currentStatusId && !memberMessage.trim() && !internalNote.trim()) {
      setError('Change the status or write a note before saving.')
      requestAnimationFrame(() => errorRef.current?.focus())
      return
    }

    setError(undefined)
    setSaving(true)
    try {
      await addRequestUpdate({ code, statusId: nextStatusId, internalNote, memberMessage })
      await onSaved(
        nextStatusId === COMPLETED_STATUS_ID && !isCompleted
          ? 'Request completed and moved to the archive.'
          : 'Update saved.',
      )
    } catch {
      setError("Couldn't save the update. Please try again.")
      setSaving(false)
    }
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    save(statusId)
  }

  return (
    <form className="card stack detail-form" onSubmit={handleSubmit} aria-labelledby="detail-form-title" noValidate>
      <h2 id="detail-form-title" className="card__title">Update this request</h2>

      <Field label="Status">
        {(control) => (
          <select {...control} value={statusId} onChange={(event) => setStatusId(Number(event.target.value))}>
            {statusTypes.map((status) => (
              <option key={status.status_type_id} value={status.status_type_id}>{status.status_type}</option>
            ))}
          </select>
        )}
      </Field>

      <Field
        label="Note for the member"
        optional
        hint={`Shown on the member's status lookup. Anyone with the code can read it, so leave out private details. ${memberMessage.length}/${NOTE_MAX}`}
      >
        {(control) => (
          <textarea
            {...control}
            value={memberMessage}
            maxLength={NOTE_MAX}
            onChange={(event) => setMemberMessage(event.target.value)}
          />
        )}
      </Field>

      <Field
        label="Internal note"
        optional
        hint={`Only the care team sees this. It never appears on the status lookup. ${internalNote.length}/${NOTE_MAX}`}
      >
        {(control) => (
          <textarea
            {...control}
            value={internalNote}
            maxLength={NOTE_MAX}
            onChange={(event) => setInternalNote(event.target.value)}
          />
        )}
      </Field>

      {error && <p ref={errorRef} tabIndex={-1} role="alert" className="field-error">{error}</p>}

      <div className="stack detail-actions">
        <Button type="submit" block disabled={saving}>{saving ? 'Saving…' : 'Save Update'}</Button>
        {!isCompleted && (
          <Button variant="outline" block disabled={saving} onClick={() => save(COMPLETED_STATUS_ID)}>
            Mark Completed
          </Button>
        )}
      </div>
      <p className="muted detail-hint">
        A status change without a note for the member posts "Status changed to …" on their lookup.
        {!isCompleted && ' Completed requests move to the archive and are never deleted.'}
      </p>
    </form>
  )
}
