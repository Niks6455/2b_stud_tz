import type { ObjectFormValues } from '@/features/objects/schemas'

export interface ObjectFormProps {
  defaultValues?: ObjectFormValues
  onSubmit: (values: ObjectFormValues) => Promise<void> | void
  submitLabel?: string
  onCancel?: () => void
}
