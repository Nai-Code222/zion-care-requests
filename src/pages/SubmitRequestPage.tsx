// src/pages/SubmitRequestPage.tsx
import { useEffect, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import ChoiceGroup, { type Choice } from '../components/ChoiceGroup'
import Field from '../components/Field'
import { getRequestFormChoices, type RequestFormChoices } from '../services/lookup'

// The choices come from the lookup tables (request_type, urgency_type, contact_method_types).
// The maps below are UI copy the tables don't hold, keyed by the table's label. A row added
// later still shows up, using its table label, until wording is written for it here.
const MEMBER_NOTES_MAX = 250 // care_requests_member_notes_length
const NAME_MAX = 100 // care_requests_first_length / _last_length

const contactLabels: Record<string, string> = {
  Phone: 'Phone call',
  Text: 'Text message',
  'No Contact': "Don't contact me",
}

const urgencyHints: Record<string, string> = {
  Urgent: 'Within 24 hours',
  Soon: 'This week',
  Routine: 'When the team can',
}

export default function SubmitRequestPage() {
  const navigate = useNavigate()
  const [anonymous, setAnonymous] = useState(false) // care_requests.anonymous_flag
  const [contactMethodId, setContactMethodId] = useState<number | null>(null) // care_requests.contact_method_id
  const [urgencyId, setUrgencyId] = useState<number | null>(null) // care_requests.urgency_type_id
  const [requestTypeId, setRequestTypeId] = useState<number | null>(null) // care_requests.request_type_id
  const [notes, setNotes] = useState('')

  // Lookup rows from Supabase; null until they arrive
  const [choices, setChoices] = useState<RequestFormChoices | null>(null)
  const [loadError, setLoadError] = useState(false)

  useEffect(() => {
    // Skip the state update if the page was left before the request finished
    let ignore = false
    getRequestFormChoices()
      .then((rows) => { if (!ignore) setChoices(rows) })
      .catch(() => { if (!ignore) setLoadError(true) })
    return () => { ignore = true }
  }, [])

  const contactChoices: Choice<number>[] = (choices?.contactMethods ?? []).map((row) => ({
    value: row.contact_method_type_id,
    label: contactLabels[row.contact_method] ?? row.contact_method,
  }))

  // Already most urgent first: getUrgencyTypes sorts by urgency_rank
  const urgencyChoices: Choice<number>[] = (choices?.urgencyTypes ?? []).map((row) => ({
    value: row.urgency_type_id,
    label: row.urgency,
    description: urgencyHints[row.urgency],
  }))

  const requestTypeChoices: Choice<number>[] = (choices?.requestTypes ?? []).map((row) => ({
    value: row.request_type_id,
    label: row.request_type,
  }))

  // The state holds an ID, but which contact field to show depends on the method's label
  const contactMethod = choices?.contactMethods.find(
    (row) => row.contact_method_type_id === contactMethodId,
  )?.contact_method

  // UI only for now: the request isn't saved yet.
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/request/submitted')
  }

  return (
    <div className="request-page">
      <section className="stack request-intro" aria-labelledby="request-title">
        <h1 id="request-title" className="page-title">How can we care for you?</h1>
        <p className="lead">
          Tell us what you need. We'll make sure a person from our care team follows up.
        </p>
      </section>

      {/* Shown whole once the choices arrive, so no question renders with an empty list */}
      {loadError ? (
        <p className="callout" role="alert">
          We couldn't load the form. Please refresh the page to try again.
        </p>
      ) : !choices ? (
        <p className="muted">Loading the form…</p>
      ) : (
        <form className="card card--lg request-form" onSubmit={handleSubmit} aria-labelledby="request-title" noValidate>
          <div className="identity-fields">
            {/* Hidden, not removed, so anything typed is still there if they uncheck */}
            <div className="auto-grid field-row" hidden={anonymous}>
              <Field label="First name">
                {(control) => <input {...control} name="first" autoComplete="given-name" maxLength={NAME_MAX} />}
              </Field>
              <Field label="Last name" optional>
                {(control) => <input {...control} name="last" autoComplete="family-name" maxLength={NAME_MAX} />}
              </Field>
            </div>
  
            <label className="choice-tile">
              <input
                type="checkbox"
                name="anonymous"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
              />
              <span className="choice-tile__text">
                <span className="choice-tile__label">Stay anonymous</span>
                <span className="choice-tile__description">No name needed. Use a code to check in.</span>
              </span>
            </label>
  
            {anonymous && (
              <p className="callout">
                We won't ask for your name. After you send, you'll get a reference code to see
                updates from the care team.
              </p>
            )}
  
            <div className="named-fields">
              <ChoiceGroup
                legend="How should we reach you?"
                name="contactMethod"
                options={contactChoices}
                value={contactMethodId}
                onChange={setContactMethodId}
                variant="pill"
              />
  
              {(contactMethod === 'Phone' || contactMethod === 'Text') && (
                <div className="field-narrow">
                  <Field label="Phone number">
                    {(control) => <input {...control} name="phone" type="tel" autoComplete="tel" />}
                  </Field>
                </div>
              )}
              {contactMethod === 'Email' && (
                <div className="field-narrow">
                  <Field label="Email address">
                    {(control) => <input {...control} name="email" type="email" autoComplete="email" maxLength={254} />}
                  </Field>
                </div>
              )}
            </div>
          </div>
  
          <ChoiceGroup
            legend="How soon do you need help?"
            name="urgency"
            options={urgencyChoices}
            value={urgencyId}
            onChange={setUrgencyId}
            minTileWidth="9.375rem"
          />
  
          <ChoiceGroup
            legend="What kind of care?"
            name="requestType"
            options={requestTypeChoices}
            value={requestTypeId}
            onChange={setRequestTypeId}
            variant="pill"
          />
  
          <Field
            label="What's on your heart?"
            size="question"
            hint={`Share only what you're comfortable with. Up to ${MEMBER_NOTES_MAX} characters.`}
            hintPosition="before"
          >
            {(control) => (
              <>
                <textarea
                  {...control}
                  name="memberNotes"
                  rows={4}
                  maxLength={MEMBER_NOTES_MAX}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  required
                />
                {/* Not a live region: announcing every keystroke would be noisy. */}
                <p className="char-count" aria-hidden="true">
                  {notes.length}/{MEMBER_NOTES_MAX}
                </p>
              </>
            )}
          </Field>
  
          <div className="form-footer">
            <Button type="submit" size="lg">Send Request</Button>
          </div>
        </form>
      )}
    </div>
  )
}
