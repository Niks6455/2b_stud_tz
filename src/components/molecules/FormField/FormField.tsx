import { Label } from '@/components/atoms'
import type { FormFieldProps } from './types'

export function FormField({ label, htmlFor, error, children }: FormFieldProps) {
  return (
    <div className="w-full">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
