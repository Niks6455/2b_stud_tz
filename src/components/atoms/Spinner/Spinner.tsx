import { cn } from '@/shared/lib/cn'
import type { SpinnerProps } from './types'

export function Spinner({ className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'size-8 animate-spin rounded-full border-2 border-line border-t-primary',
        className,
      )}
      role="status"
      aria-label="Загрузка"
    />
  )
}
