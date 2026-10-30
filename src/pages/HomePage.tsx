// src/pages/HomePage.tsx
import { Form } from 'react-router-dom'
import { Button, ButtonLink } from '../components/Button'
import { IconBadge, NumberBadge } from '../components/CircleBadge'
import EmergencyNote from '../components/EmergencyNote'
import type { IconName } from '../components/Icon'
import ReferenceCodeField from '../components/ReferenceCodeField'
import Section from '../components/Section'

const steps = [
  {
    title: 'Tell us what you need',
    body: 'A short form that takes about a minute.',
  },
  {
    title: 'Save your code',
    body: "You'll get a reference code. No account or password needed.",
  },
  {
    title: 'We follow up',
    body: 'The care team reaches out or posts updates you can check anytime.',
  },
]

const helpTopics: { label: string; icon: IconName }[] = [
  { label: 'Prayer', icon: 'heart' },
  { label: 'Hospital visits', icon: 'hospital' },
  { label: 'Grief and loss', icon: 'drop' },
  { label: 'Family matters', icon: 'family' },
  { label: 'Financial need', icon: 'home' },
  { label: 'Anything else on your heart', icon: 'message' },
]

export default function HomePage() {
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="stack hero__intro">
          <h1 id="hero-title" className="hero__title">Zion Care Request</h1>
          <p className="lead hero__subtitle">
            Ask our care team for prayer, a visit, or support. Your request always remain private, and you never have to give your name.
          </p>
          <div className="button-row">
            <ButtonLink to="/request" size="lg">Ask for Care</ButtonLink>
            <ButtonLink to="/status" size="lg" variant="outline">Check a Request</ButtonLink>
          </div>
        </div>

      </section>

      <Section title="How it works">
        {/* role="list" keeps list semantics in Safari/VoiceOver once list-style is removed */}
        <ol className="auto-grid list-reset steps" role="list">
          {steps.map((step, i) => (
            <li key={step.title} className="card stack step">
              <NumberBadge value={i + 1} />
              <h3 className="step__title">{step.title}</h3>
              <p className="muted">{step.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="We can help with">
        <ul className="auto-grid list-reset topics" role="list">
          {helpTopics.map((topic) => (
            <li key={topic.label} className="card topic">
              <IconBadge name={topic.icon} />
              <span className="topic__label">{topic.label}</span>
            </li>
          ))}
        </ul>
      </Section>

      
    </div>
  )
}
