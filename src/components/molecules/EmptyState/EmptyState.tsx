import { cn } from '@/shared/lib/cn'
import type { EmptyStateProps } from './types'

export function EmptyState({
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-paper-elevated/50 px-6 py-16 text-center',
        className,
      )}
    >
      <h3 className="font-display text-2xl text-ink">{title}</h3>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  )
}
