import type { TaskWithRelations, UserRole } from '@/shared/types/database'

export interface KanbanBoardProps {
  tasks: TaskWithRelations[]
  role: UserRole
  userId: string
  onMove: (
    taskId: string,
    toStatus: TaskWithRelations['status'],
    comment?: string,
  ) => Promise<void>
  busy?: boolean
}
