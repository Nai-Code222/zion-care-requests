// src/components/Section.tsx
import { useId, type ReactNode } from 'react'

type Props = {
  title: ReactNode
  /** Heading level; pages have one h1, so sections default to h2. */
  level?: 2 | 3
  className?: string
  titleClassName?: string
  children: ReactNode
}

/** A <section> labelled by its own heading, so screen readers list it as a named region. */
export default function Section({ title, level = 2, className = 'stack', titleClassName = 'section-title', children }: Props) {
  const id = useId()
  const Heading = `h${level}` as const
  return (
    <section className={className} aria-labelledby={id}>
      <Heading id={id} className={titleClassName}>{title}</Heading>
      {children}
    </section>
  )
}
