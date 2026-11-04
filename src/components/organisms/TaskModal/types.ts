import type { TaskFormValues } from '@/features/tasks/schemas'

export interface TaskModalProps {
  open: boolean
  onClose: () => void
  mode?: 'create' | 'edit'
  taskId?: string
  defaultObjectId?: string
  defaultValues?: Partial<TaskFormValues>
  onSuccess?: (taskId?: string) => void
  navigateOnCreate?: boolean
}
