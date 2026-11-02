// src/components/DateTime.tsx
const dateTimeFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' })
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' })

/** A database timestamp shown in the viewer's locale, with the machine-readable value kept on <time>. */
export default function DateTime({ value, dateOnly }: { value: string; dateOnly?: boolean }) {
  return <time dateTime={value}>{(dateOnly ? dateFormat : dateTimeFormat).format(new Date(value))}</time>
}
