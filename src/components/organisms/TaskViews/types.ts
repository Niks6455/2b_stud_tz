import type { TasksViewMode } from '@/components/molecules'
import type { TaskWithRelations } from '@/shared/types/database'

export interface TaskViewsProps {
  tasks: TaskWithRelations[]
  mode: TasksViewMode
}
