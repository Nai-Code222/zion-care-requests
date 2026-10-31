// src/components/ChoiceGroup.tsx
import { useId, type CSSProperties, type ReactNode } from 'react'

export type Choice<T extends string | number> = {
  value: T
  label: ReactNode
  description?: ReactNode
}

type Props<T extends string | number> = {
  legend: ReactNode
  name: string
  options: Choice<T>[]
  value: T | null
  onChange: (value: T) => void
  /** "tile": card with a radio dot and description. "pill": compact rounded chip. */
  variant?: 'tile' | 'pill'
  /** Narrowest a tile may get before the row wraps. */
  minTileWidth?: string
  optional?: boolean
  error?: ReactNode
  children?: ReactNode
}

/**
 * A single-choice question built on real radio buttons inside a <fieldset>, so arrow keys,
 * screen-reader "1 of 3" announcements and form semantics all come for free.
 */
export default function ChoiceGroup<T extends string | number>({
  legend,
  name,
  options,
  value,
  onChange,
  variant = 'tile',
  minTileWidth = '13.75rem',
  optional,
  error,
  children,
}: Props<T>) {
  const errorId = useId()

  return (
    <fieldset className="choice-group">
      <legend className="question">
        {legend}
        {optional && <span className="field-optional"> (optional)</span>}
      </legend>
      <div
        className={variant === 'tile' ? 'auto-grid choice-tiles' : 'choice-pills'}
        style={variant === 'tile' ? { '--grid-min': minTileWidth } as CSSProperties : undefined}
      >
        {options.map((option) => (
          <label key={option.value} className={variant === 'tile' ? 'choice-tile' : 'choice-pill'}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              aria-describedby={error ? errorId : undefined}
              aria-invalid={error ? true : undefined}
            />
            {variant === 'tile' ? (
              <span className="choice-tile__text">
                <span className="choice-tile__label">{option.label}</span>
                {option.description && <span className="choice-tile__description">{option.description}</span>}
              </span>
            ) : (
              option.label
            )}
          </label>
        ))}
      </div>
      {error && <p id={errorId} className="field-error">{error}</p>}
      {children}
    </fieldset>
  )
}
