// src/components/ReferenceCodeField.tsx
import Field from './Field'

type Props = {
  name?: string
  defaultValue?: string
  hint?: string
  error?: string
}

/** The "ZC-…" code input shared by the home page card and the status page. */
export default function ReferenceCodeField({ name = 'code', defaultValue, hint, error }: Props) {
  return (
    <Field label="Reference code" hint={hint} error={error}>
      {(control) => (
        <input
          {...control}
          name={name}
          defaultValue={defaultValue}
          className="input--code"
          placeholder="ZC-"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          required
        />
      )}
    </Field>
  )
}
