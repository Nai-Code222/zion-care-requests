// src/pages/NotFoundPage.tsx
import { ButtonLink } from '../components/Button'

export default function NotFoundPage() {
  return (
    <section className="stack text-center" aria-labelledby="not-found-title">
      <h1 id="not-found-title" className="page-title">Page not found</h1>
      <p className="lead">That link doesn't go anywhere. It may have been mistyped or moved.</p>
      <div className="button-row">
        <ButtonLink to="/">Back to Home</ButtonLink>
      </div>
    </section>
  )
}
