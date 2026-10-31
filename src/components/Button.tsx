// src/components/Button.tsx
import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'outline' | 'soft' | 'inverse'

type StyleProps = {
  variant?: Variant
  size?: 'md' | 'lg'
  /** Stretch to the container's width (e.g. inside a card). */
  block?: boolean
}

function buttonClass({ variant = 'primary', size = 'md', block }: StyleProps, extra?: string) {
  return [
    'btn',
    variant !== 'primary' && `btn--${variant}`,
    size === 'lg' && 'btn--lg',
    block && 'btn--block',
    extra,
  ]
    .filter(Boolean)
    .join(' ')
}

/** A navigation link styled as a button. Use for "go somewhere" actions. */
export function ButtonLink({ variant, size, block, className, ...rest }: LinkProps & StyleProps) {
  return <Link className={buttonClass({ variant, size, block }, className)} {...rest} />
}

/** A real <button>. Defaults to type="button" so it never submits a form by accident. */
export function Button({
  variant,
  size,
  block,
  className,
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & StyleProps) {
  return <button type={type} className={buttonClass({ variant, size, block }, className)} {...rest} />
}
