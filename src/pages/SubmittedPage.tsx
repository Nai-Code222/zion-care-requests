// src/pages/SubmittedPage.tsx
import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Button, ButtonLink } from '../components/Button'
import { NumberBadge } from '../components/CircleBadge'
import Icon from '../components/Icon'
import Section from '../components/Section'

const nextSteps = [
  'A care team member reads your request. Urgent requests are seen first.',
  'If you asked us to reach out, someone will contact you directly.',
  'Check back anytime with your code to see updates.',
]

// UI only for now: the request form will pass the real code in router state.
const SAMPLE_CODE = 'ZC-7K4M2P'

export default function SubmittedPage() {
  const location = useLocation()
  const code = (location.state as { code?: string } | null)?.code ?? SAMPLE_CODE
  const [copyMessage, setCopyMessage] = useState('')

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      setCopyMessage('Code copied.')
    } catch {
      setCopyMessage("Couldn't copy. Select the code and copy it yourself.")
    }
  }

  return (
    <div className="submitted-page">
      <div className="card card--lg stack submitted-card">
        <div className="stack submitted-hero">
          <span className="circle-badge circle-badge--tint circle-badge--lg success-badge" aria-hidden="true">
            <Icon name="check" size={30} />
          </span>
          <h1 className="page-title">Your request was received</h1>
          <p className="lead">
            Thank you for reaching out. Our care team will review it, and we're praying with you.
          </p>
        </div>

        <section className="stack code-panel" aria-labelledby="code-label">
          <h2 id="code-label" className="code-panel__label">Your reference code</h2>
          <p className="code-panel__code">{code}</p>
          <p className="muted">Save it somewhere safe. You'll need it to check on your request.</p>
          <div className="code-panel__actions no-print">
            <Button variant="outline" onClick={copyCode}>
              <Icon name="copy" size={19} /> Copy Code
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <Icon name="print" size={19} /> Print
            </Button>
          </div>
          {/* Announces the copy result to screen readers; also visible as confirmation */}
          <p className="code-panel__status" role="status">{copyMessage}</p>
        </section>

        <Section title="What happens next" titleClassName="card__title">
          <ol className="icon-list next-steps" role="list">
            {nextSteps.map((step, i) => (
              <li key={step}>
                <NumberBadge value={i + 1} small />
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Section>

        <div className="form-footer no-print">
          <ButtonLink to="/status" size="lg">Check Status</ButtonLink>
          <Link to="/" className="nav-link">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
