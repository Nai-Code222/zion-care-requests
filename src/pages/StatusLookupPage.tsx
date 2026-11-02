// src/pages/StatusLookupPage.tsx
import { useEffect, useRef, useState, type RefObject, type SubmitEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/Button'
import DateTime from '../components/DateTime'
import ReferenceCodeField from '../components/ReferenceCodeField'
import { lookupCareRequest, type LookupResult } from '../services/careRequests'

// One value for the whole lookup, so the page can't be loading and showing an error at once
type LookupState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'notFound' }
  | { kind: 'error' }
  | { kind: 'found'; result: LookupResult }

export default function StatusLookupPage() {
  const [state, setState] = useState<LookupState>({ kind: 'idle' })
  const [fieldError, setFieldError] = useState<string>()
  const resultHeading = useRef<HTMLHeadingElement>(null)

  // Move focus to the result once it renders, so screen reader users hear it without hunting for it
  useEffect(() => {
    if (state.kind === 'found') resultHeading.current?.focus()
  }, [state])

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (state.kind === 'loading') return

    const form = event.currentTarget
    // No format check here: the database trims and uppercases, so "zc-7k3m-9qxp " still matches
    const code = String(new FormData(form).get('code') ?? '').trim()
    if (!code) {
      setFieldError('Enter the reference code you were given.')
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    setFieldError(undefined)
    setState({ kind: 'loading' })
    try {
      const result = await lookupCareRequest(code)
      setState(result ? { kind: 'found', result } : { kind: 'notFound' })
    } catch {
      setState({ kind: 'error' })
    }
  }

  const loading = state.kind === 'loading'

  return (
    <div className="status-page">
      <section className="stack status-intro" aria-labelledby="status-title">
        <h1 id="status-title" className="page-title">Check on your request</h1>
        <p className="lead">Enter the reference code you received when you sent your request.</p>
      </section>

      <form
        className="card card--lg stack status-form"
        onSubmit={handleSubmit}
        aria-labelledby="status-title"
        aria-busy={loading || undefined}
        noValidate
      >
        <ReferenceCodeField
          hint="It looks like ZC-7K3M-9QXP."
          error={fieldError}
        />
        <Button type="submit" size="lg" block disabled={loading}>
          {loading ? 'Looking up…' : 'Check Status'}
        </Button>
        {/* Always rendered, so screen readers notice when a message is added */}
        <div role="alert" aria-live="polite" className="stack status-messages">
          {state.kind === 'notFound' && (
            <p className="callout">
              We couldn't find a request with that code. Check it against the code you saved and try
              again, or <Link to="/request" className="strong-link">send a new request</Link>.
            </p>
          )}
          {state.kind === 'error' && (
            <p className="callout">Something went wrong looking up your request. Please try again.</p>
          )}
        </div>
      </form>

      {state.kind === 'found' && (
        <StatusResult result={state.result} headingRef={resultHeading} />
      )}
    </div>
  )
}

function StatusResult({
  result: { request, updates },
  headingRef,
}: {
  result: LookupResult
  headingRef: RefObject<HTMLHeadingElement | null>
}) {
  return (
    <section className="card card--lg stack status-result" aria-labelledby="status-result-title">
      <div className="stack status-summary">
        <p className="eyebrow">{request.reference_code}</p>
        {/* tabIndex -1: focusable from code (see the effect above), but not a tab stop */}
        <h2 id="status-result-title" className="status-summary__title" ref={headingRef} tabIndex={-1}>
          {request.status_type}
        </h2>
        <dl className="status-facts">
          <div>
            <dt>Request</dt>
            <dd>{request.request_type}</dd>
          </div>
          <div>
            <dt>Sent</dt>
            <dd><DateTime value={request.created_at} /></dd>
          </div>
          <div>
            <dt>Last updated</dt>
            <dd><DateTime value={request.updated_at} /></dd>
          </div>
        </dl>
      </div>

      <section className="stack status-notes" aria-labelledby="status-notes-title">
        <h3 id="status-notes-title" className="card__title">What's on your heart</h3>
        <p className="status-notes__text">{request.member_notes}</p>
      </section>

      <section className="stack" aria-labelledby="status-updates-title">
        <h3 id="status-updates-title" className="card__title">Updates</h3>
        {updates.length === 0 ? (
          <p className="muted">No updates yet. The care team will post here as your request moves along.</p>
        ) : (
          // Oldest first, as get_request_updates orders them
          <ol className="list-reset status-updates" role="list">
            {updates.map((update) => (
              <li key={update.activity_log_id} className="status-update">
                {/* The submission's confirmation row has the same status on both sides */}
                <p className="status-update__change">
                  {update.old_status_id === update.new_status_id
                    ? update.new_status
                    : `${update.old_status} → ${update.new_status}`}
                </p>
                <p className="muted status-update__time"><DateTime value={update.timestamp} /></p>
                {/* Not every status change comes with a note for the member */}
                {update.member_message && <p>{update.member_message}</p>}
              </li>
            ))}
          </ol>
        )}
      </section>
    </section>
  )
}
