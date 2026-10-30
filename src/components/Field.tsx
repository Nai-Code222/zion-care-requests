// src/components/Field.tsx
import { useId, type ReactNode } from 'react'

export type ControlProps = {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

type FieldProps = {
  label: ReactNode
  hint?: ReactNode
  error?: ReactNode
  optional?: boolean
  /** "question": the label reads as a form question (same size as a fieldset legend). */
  size?: 'default' | 'question'
  /** Hints usually follow the control; "before" puts guidance between label and control. */
  hintPosition?: 'before' | 'after'
  /** Render the control with the props that wire it to the label, hint and error. */
  children: (control: ControlProps) => ReactNode
}

/**
 * Label + control + hint + error, with ids and aria wiring handled for you:
 *   <Field label="Your name">{(p) => <input {...p} name="name" />}</Field>
 */
export default function Field({
  label,
  hint,
  error,
  optional,
  size = 'default',
  hintPosition = 'after',
  children,
}: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const hintEl = hint && <p id={hintId} className="field-hint">{hint}</p>

  return (
    <div className="field">
      <label htmlFor={id} className={size === 'question' ? 'question' : undefined}>
        {label}
        {optional && <span className="field-optional"> (optional)</span>}
      </label>
      {hintPosition === 'before' && hintEl}
      {children({ id, 'aria-describedby': describedBy, ...(error ? { 'aria-invalid': true } : {}) })}
      {hintPosition === 'after' && hintEl}
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  )
}
