import type { TaskStatus, UserRole } from '@/shared/types/database'

export interface TaskActionsProps {
  status: TaskStatus
  role: UserRole
  isAssignee: boolean
  loading?: boolean
  onAction: (to: TaskStatus, comment?: string) => Promise<void> | void
}
