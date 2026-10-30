// src/pages/SubmitRequestPage.tsx
import { useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/Button'
import ChoiceGroup, { type Choice } from '../components/ChoiceGroup'
import { IconBadge } from '../components/CircleBadge'
import Field from '../components/Field'
import type { IconName } from '../components/Icon'

// Labels match the lookup tables (request_type, urgency_type, contact_method_types).
// They'll be swapped for the table rows (with IDs) when the form is wired to Supabase.
const MEMBER_NOTES_MAX = 250 // care_requests_member_notes_length
const NAME_MAX = 100 // care_requests_first_length / _last_length

const reassurances: { icon: IconName; title: string; body: string }[] = [
  { icon: 'shield', title: 'Private.', body: 'Only the care team reads it. Other members never see it.' },
  { icon: 'clock', title: 'About a minute.', body: 'A few short questions.' },
  { icon: 'card', title: 'No account needed.', body: "You'll get a code to check on your request." },
]

const privacyChoices: Choice<'named' | 'anonymous'>[] = [
  { value: 'named', label: 'Share my name', description: 'The care team can reach out to you.' },
  { value: 'anonymous', label: 'Stay anonymous', description: 'No name needed. Use a code to check in.' },
]

type ContactMethod = 'Phone' | 'Email' | 'Text' | 'No Contact'

const contactChoices: Choice<ContactMethod>[] = [
  { value: 'Phone', label: 'Phone call' },
  { value: 'Text', label: 'Text message' },
  { value: 'Email', label: 'Email' },
  { value: 'No Contact', label: "Don't contact me" },
]

// Most urgent first, matching urgency_rank
const urgencyChoices: Choice<string>[] = [
  { value: 'Urgent', label: 'Urgent', description: 'Within 24 hours' },
  { value: 'Soon', label: 'Soon', description: 'This week' },
  { value: 'Routine', label: 'Routine', description: 'When the team can' },
]

const requestTypes: Choice<string>[] = [
  'Prayer Support',
  'Hospital Visit',
  'Meal Delivery',
  'Counseling Referral',
  'Other',
].map((label) => ({ value: label, label }))

export default function SubmitRequestPage() {
  const navigate = useNavigate()
  const [privacy, setPrivacy] = useState<'named' | 'anonymous'>('named')
  const [contactMethod, setContactMethod] = useState<ContactMethod | null>(null)
  const [urgency, setUrgency] = useState<string | null>(null)
  const [requestType, setRequestType] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  // UI only for now: the request isn't saved yet.
  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/request/submitted')
  }

  return (
    <div className="request-page">
      <section className="stack request-intro" aria-labelledby="request-title">
        <p className="eyebrow">Pastoral Care</p>
        <h1 id="request-title" className="page-title">How can we care for you?</h1>
        <p className="lead">
          Tell us what you need. We'll make sure the right person from our care team follows up.
        </p>
        <ul className="icon-list reassurances" role="list">
          {reassurances.map((item) => (
            <li key={item.title}>
              <IconBadge name={item.icon} tone="surface" />
              <span>
                <strong>{item.title}</strong> {item.body}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <form className="card card--lg request-form" onSubmit={handleSubmit} aria-labelledby="request-title" noValidate>
        <ChoiceGroup
          legend="Should we know who you are?"
          name="privacy"
          options={privacyChoices}
          value={privacy}
          onChange={setPrivacy}
        >
          {privacy === 'named' ? (
            <div className="named-fields">
              <div className="auto-grid field-row">
                <Field label="First name">
                  {(control) => <input {...control} name="first" autoComplete="given-name" maxLength={NAME_MAX} />}
                </Field>
                <Field label="Last name" optional>
                  {(control) => <input {...control} name="last" autoComplete="family-name" maxLength={NAME_MAX} />}
                </Field>
              </div>

              <ChoiceGroup
                legend="How should we reach you?"
                name="contactMethod"
                options={contactChoices}
                value={contactMethod}
                onChange={setContactMethod}
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
          ) : (
            <p className="callout">
              We won't ask for your name or contact. After you send, you'll get a reference code to
              see updates from the care team.
            </p>
          )}
        </ChoiceGroup>

        <ChoiceGroup
          legend="How soon do you need help?"
          name="urgency"
          options={urgencyChoices}
          value={urgency}
          onChange={setUrgency}
          minTileWidth="9.375rem"
        />

        <ChoiceGroup
          legend="What kind of care?"
          name="requestType"
          options={requestTypes}
          value={requestType}
          onChange={setRequestType}
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
          <p className="muted">Seen only by Zion's pastoral care team.</p>
        </div>
      </form>
    </div>
  )
}
