// src/pages/SubmitRequestPage.tsx
import { useEffect, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import ChoiceGroup, { type Choice } from '../components/ChoiceGroup'
import Field from '../components/Field'
import { submitCareRequest } from '../services/careRequests'
import { getRequestFormChoices, type RequestFormChoices } from '../services/lookup'

// The choices come from the lookup tables (request_type, urgency_type, contact_method_types).
// The maps below are UI copy the tables don't hold, keyed by the table's label. A row added
// later still shows up, using its table label, until wording is written for it here.
const MEMBER_NOTES_MAX = 250 // care_requests_member_notes_length
const NAME_MAX = 100 // care_requests_first_length / _last_length
// Same rules as the database checks, so a bad value is caught here with a clear message
const PHONE_PATTERN = /^\+?[0-9 ().-]{7,20}$/
const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/ 

type FormErrors = Partial<
  Record<'name' | 'contactMethod' | 'phone' | 'email' | 'urgency' | 'requestType' | 'memberNotes', string>
>

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
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(false)

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

  // The state holds an ID, but which contact field to show depends on the method's label
  const contactMethod = choices?.contactMethods.find(
    (row) => row.contact_method_type_id === contactMethodId,
  )?.contact_method
  const needsPhone = contactMethod === 'Phone' || contactMethod === 'Text'
  const needsEmail = contactMethod === 'Email'

  // An error goes away as soon as the person changes that answer
  function clearErrors(...keys: (keyof FormErrors)[]) {
    setErrors((current) => {
      const next = { ...current }
      for (const key of keys) delete next[key]
      return next
    })
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting) return

    const form = event.currentTarget
    const data = new FormData(form)
    const text = (name: string) => String(data.get(name) ?? '').trim()
    const first = text('first')
    const last = text('last')
    const phone = text('phone')
    const email = text('email')

    const found: FormErrors = {}
    if (!anonymous && !first) found.name = 'Enter your first name, or choose Stay anonymous.'
    if (contactMethodId === null) found.contactMethod = 'Choose how we should reach you.'
    if (needsPhone && !PHONE_PATTERN.test(phone)) {
      found.phone = phone ? 'Enter a phone number like 301-555-0142.' : 'Enter a phone number.'
    }
    if (needsEmail && !EMAIL_PATTERN.test(email)) {
      found.email = email ? 'Enter an email address like name@example.com.' : 'Enter an email address.'
    }
    if (urgencyId === null) found.urgency = 'Choose how soon you need help.'
    if (requestTypeId === null) found.requestType = 'Choose the kind of care you need.'
    if (!notes.trim()) found.memberNotes = 'Tell us a little about what you need.'

    if (Object.keys(found).length > 0 || contactMethodId === null || urgencyId === null || requestTypeId === null) {
      setErrors(found)
      // Move focus to the first problem once it renders, so keyboard and screen reader users
      // land on it and hear its error message
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }

    setErrors({})
    setSubmitError(false)
    setSubmitting(true)
    try {
      const code = await submitCareRequest({
        p_request_type_id: requestTypeId,
        p_urgency_type_id: urgencyId,
        p_contact_method_id: contactMethodId,
        // An anonymous request never sends a name, even one typed before the box was checked
        p_anonymous: anonymous,
        p_first: anonymous ? undefined : first,
        p_last: anonymous || !last ? undefined : last,
        p_no_contact: contactMethod === 'No Contact',
        p_phone: needsPhone ? phone : undefined,
        p_email: needsEmail ? email : undefined,
        p_member_notes: notes.trim(),
      })
      // replace: Back from the confirmation skips the sent form instead of inviting a second send
      navigate('/request/submitted', { state: { code }, replace: true })
    } catch {
      setSubmitError(true)
      setSubmitting(false)
    }
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
        <form
          className="card card--lg request-form"
          onSubmit={handleSubmit}
          aria-labelledby="request-title"
          aria-busy={submitting || undefined}
          noValidate
        >
          <div className="identity-fields">
            {/* Hidden, not removed, so anything typed is still there if they uncheck */}
            <div className="auto-grid field-row" hidden={anonymous}>
              <Field label="First name" error={errors.name}>
                {(control) => (
                  <input
                    {...control}
                    name="first"
                    autoComplete="given-name"
                    maxLength={NAME_MAX}
                    onChange={() => clearErrors('name')}
                  />
                )}
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
                onChange={(e) => {
                  setAnonymous(e.target.checked)
                  clearErrors('name')
                }}
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
                onChange={(id) => {
                  setContactMethodId(id)
                  clearErrors('contactMethod', 'phone', 'email')
                }}
                variant="pill"
                error={errors.contactMethod}
              />

              {needsPhone && (
                <div className="field-narrow">
                  <Field label="Phone number" error={errors.phone}>
                    {(control) => (
                      <input
                        {...control}
                        name="phone"
                        type="tel"
                        autoComplete="tel"
                        onChange={() => clearErrors('phone')}
                      />
                    )}
                  </Field>
                </div>
              )}
              {needsEmail && (
                <div className="field-narrow">
                  <Field label="Email address" error={errors.email}>
                    {(control) => (
                      <input
                        {...control}
                        name="email"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        onChange={() => clearErrors('email')}
                      />
                    )}
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
            onChange={(id) => {
              setUrgencyId(id)
              clearErrors('urgency')
            }}
            minTileWidth="9.375rem"
            error={errors.urgency}
          />
  
          <div className="field-narrow">
            <Field label="What kind of care?" size="question" error={errors.requestType}>
              {(control) => (
                <select
                  {...control}
                  name="requestType"
                  value={requestTypeId ?? ''}
                  onChange={(e) => {
                    setRequestTypeId(Number(e.target.value))
                    clearErrors('requestType')
                  }}
                  required
                >
                  {/* Disabled so it can't be chosen again once a real type is picked */}
                  <option value="" disabled>Choose a type of care</option>
                  {choices.requestTypes.map((row) => (
                    <option key={row.request_type_id} value={row.request_type_id}>
                      {row.request_type}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
  
          <Field
            label="What's on your heart?"
            size="question"
            hint={`Share only what you're comfortable with. Up to ${MEMBER_NOTES_MAX} characters.`}
            hintPosition="before"
            error={errors.memberNotes}
          >
            {(control) => (
              <>
                <textarea
                  {...control}
                  name="memberNotes"
                  rows={4}
                  maxLength={MEMBER_NOTES_MAX}
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value)
                    clearErrors('memberNotes')
                  }}
                  required
                />
                {/* Not a live region: announcing every keystroke would be noisy. */}
                <p className="char-count" aria-hidden="true">
                  {notes.length}/{MEMBER_NOTES_MAX}
                </p>
              </>
            )}
          </Field>
  
          {submitError && (
            <p className="callout" role="alert">
              We couldn't send your request. Please check your connection and try again.
            </p>
          )}

          <div className="form-footer">
            {/* aria-disabled rather than disabled, so the button stays focusable while sending */}
            <Button type="submit" size="lg" aria-disabled={submitting || undefined}>
              {submitting ? (
                <>
                  <span className="spinner" aria-hidden="true" /> Sending…
                </>
              ) : (
                'Send Request'
              )}
            </Button>
            {/* Always rendered so screen readers are listening before the text changes */}
            <p className="visually-hidden" role="status">
              {submitting ? 'Sending your request. Please wait.' : ''}
            </p>
          </div>
        </form>
      )}
    </div>
  )
}
