// src/components/CircleBadge.tsx
import Icon, { type IconName } from './Icon'

type Tone = 'tint' | 'surface'

/** Decorative icon in a circle, e.g. beside a help topic or a reassurance bullet. */
export function IconBadge({ name, tone = 'tint' }: { name: IconName; tone?: Tone }) {
  return (
    <span className={`circle-badge circle-badge--${tone}`} aria-hidden="true">
      <Icon name={name} size={tone === 'surface' ? 20 : 22} />
    </span>
  )
}

/**
 * Step number in a circle. Hidden from screen readers because it sits inside an
 * <ol>, which already announces the position.
 */
export function NumberBadge({ value, small }: { value: number; small?: boolean }) {
  return (
    <span className={`circle-badge circle-badge--tint circle-badge--number${small ? ' circle-badge--sm' : ''}`} aria-hidden="true">
      {value}
    </span>
  )
}
