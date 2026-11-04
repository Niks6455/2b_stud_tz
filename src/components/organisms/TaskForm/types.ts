import type { TaskFormValues } from '@/features/tasks/schemas'
import type { ConstructionObject, Profile } from '@/shared/types/database'

export interface TaskFormProps {
  objects: ConstructionObject[]
  executors: Profile[]
  defaultValues?: Partial<TaskFormValues>
  lockObjectId?: boolean
  onSubmit: (values: TaskFormValues) => Promise<void> | void
  submitLabel?: string
  onCancel?: () => void
}
