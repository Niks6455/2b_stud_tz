import { Badge, type BadgeTone } from '@/components/atoms'
import { TASK_STATUS_LABELS } from '@/lib/status-machine'
import type { TaskStatus } from '@/shared/types/database'
import type { StatusBadgeProps } from './types'

const STATUS_TONES: Record<TaskStatus, BadgeTone> = {
  new: 'steel',
  in_progress: 'info',
  review: 'warning',
  rework: 'danger',
  accepted: 'success',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge tone={STATUS_TONES[status]}>{TASK_STATUS_LABELS[status]}</Badge>
  )
}
