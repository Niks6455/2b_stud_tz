import type { TaskStatus, UserRole } from '@/shared/types/database'

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  new: 'Новая',
  in_progress: 'В работе',
  review: 'На проверке',
  rework: 'На доработке',
  accepted: 'Принята',
}

export const ROLE_LABELS: Record<UserRole, string> = {
  manager: 'Постановщик',
  executor: 'Исполнитель',
}

export interface TaskAction {
  to: TaskStatus
  label: string
  requiresComment: boolean
  variant: 'primary' | 'secondary' | 'danger' | 'success'
}

const MANAGER_ACTIONS: Partial<Record<TaskStatus, TaskAction[]>> = {
  review: [
    {
      to: 'accepted',
      label: 'Принять',
      requiresComment: false,
      variant: 'success',
    },
    {
      to: 'rework',
      label: 'Вернуть на доработку',
      requiresComment: true,
      variant: 'danger',
    },
  ],
}

const EXECUTOR_ACTIONS: Partial<Record<TaskStatus, TaskAction[]>> = {
  new: [
    {
      to: 'in_progress',
      label: 'Взять в работу',
      requiresComment: false,
      variant: 'primary',
    },
  ],
  in_progress: [
    {
      to: 'review',
      label: 'Отправить на проверку',
      requiresComment: false,
      variant: 'primary',
    },
  ],
  rework: [
    {
      to: 'in_progress',
      label: 'Вернуться в работу',
      requiresComment: false,
      variant: 'primary',
    },
  ],
}

export function getAvailableActions(
  status: TaskStatus,
  role: UserRole,
  isAssignee: boolean,
): TaskAction[] {
  if (role === 'manager') {
    return MANAGER_ACTIONS[status] ?? []
  }
  if (role === 'executor' && isAssignee) {
    return EXECUTOR_ACTIONS[status] ?? []
  }
  return []
}

export function canEditTaskFields(
  status: TaskStatus,
  role: UserRole,
): boolean {
  return role === 'manager' && status !== 'accepted'
}

export function canTransitionTo(
  from: TaskStatus,
  to: TaskStatus,
  role: UserRole,
  isAssignee: boolean,
): boolean {
  if (from === to) return true
  return getAvailableActions(from, role, isAssignee).some((a) => a.to === to)
}

export function transitionNeedsComment(
  from: TaskStatus,
  to: TaskStatus,
  role: UserRole,
  isAssignee: boolean,
): boolean {
  return (
    getAvailableActions(from, role, isAssignee).find((a) => a.to === to)
      ?.requiresComment ?? false
  )
}

export const TASK_STATUSES: TaskStatus[] = [
  'new',
  'in_progress',
  'review',
  'rework',
  'accepted',
]

export const STATUS_COLUMN_ACCENT: Record<TaskStatus, string> = {
  new: 'bg-sky-500',
  in_progress: 'bg-indigo-500',
  review: 'bg-orange-500',
  rework: 'bg-rose-500',
  accepted: 'bg-emerald-500',
}
