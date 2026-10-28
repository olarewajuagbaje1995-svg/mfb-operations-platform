import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'

interface FieldShellProps {
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (id: string, describedBy: string | undefined) => ReactNode
}

// Responsibility: label + control + hint + error message, wired for screen readers.
function FieldShell({ label, error, hint, required, children }: FieldShellProps) {
  const id = useId()
  const describedBy = error ? `${id}-err` : hint ? `${id}-hint` : undefined
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label} {required && <span aria-hidden="true" className="text-red-600">*</span>}
      </label>
      {children(id, describedBy)}
      {hint && !error && <p id={`${id}-hint`} className="text-xs text-muted">{hint}</p>}
      {error && <p id={`${id}-err`} role="alert" className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

const CONTROL =
  'block w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink shadow-sm focus:border-brand-600 focus:outline-2 focus:outline-brand-600 disabled:bg-slate-100'

type Common = { label: string; error?: string; hint?: string; required?: boolean }

export const TextField = forwardRef<HTMLInputElement, Common & InputHTMLAttributes<HTMLInputElement>>(
  function TextField({ label, error, hint, required, ...rest }, ref) {
    return (
      <FieldShell label={label} error={error} hint={hint} required={required}>
        {(id, d) => <input id={id} ref={ref} aria-invalid={!!error} aria-describedby={d} className={CONTROL} {...rest} />}
      </FieldShell>
    )
  },
)

export const SelectField = forwardRef<HTMLSelectElement, Common & SelectHTMLAttributes<HTMLSelectElement>>(
  function SelectField({ label, error, hint, required, children, ...rest }, ref) {
    return (
      <FieldShell label={label} error={error} hint={hint} required={required}>
        {(id, d) => (
          <select id={id} ref={ref} aria-invalid={!!error} aria-describedby={d} className={CONTROL} {...rest}>
            {children}
          </select>
        )}
      </FieldShell>
    )
  },
)

export const TextAreaField = forwardRef<HTMLTextAreaElement, Common & TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function TextAreaField({ label, error, hint, required, ...rest }, ref) {
    return (
      <FieldShell label={label} error={error} hint={hint} required={required}>
        {(id, d) => <textarea id={id} ref={ref} rows={4} aria-invalid={!!error} aria-describedby={d} className={CONTROL} {...rest} />}
      </FieldShell>
    )
  },
)