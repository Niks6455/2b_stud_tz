import type { ObjectFormValues } from '@/features/objects/schemas'

export interface ObjectModalProps {
  open: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  objectId?: string
  defaultValues?: ObjectFormValues
  onSuccess?: (objectId?: string) => void
}
