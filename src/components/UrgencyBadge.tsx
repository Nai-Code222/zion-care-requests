// src/components/UrgencyBadge.tsx

/** Urgency label in its color. The word is always shown, so color is never the only signal. */
export default function UrgencyBadge({ urgency }: { urgency: string }) {
  return <span className={`badge badge--${urgency.toLowerCase()}`}>{urgency}</span>
}
