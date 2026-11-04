import { cn } from '@/shared/lib/cn'
import type { LabelProps } from './types'

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn(
        'mb-1.5 block text-sm font-medium text-ink-muted',
        className,
      )}
      {...props}
    />
  )
}
