import type { TaskStatus } from '@/shared/types/database'

export type StatusFilterValue = 'all' | TaskStatus

export interface StatusFilterProps {
  value: StatusFilterValue
  onChange: (value: StatusFilterValue) => void
  className?: string
}
