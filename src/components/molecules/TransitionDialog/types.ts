import type { TaskStatus } from '@/shared/types/database'

export interface TransitionDialogProps {
  open: boolean
  taskTitle: string
  from: TaskStatus
  to: TaskStatus
  actionLabel: string
  commentRequired: boolean
  comment: string
  onCommentChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  danger?: boolean
}
