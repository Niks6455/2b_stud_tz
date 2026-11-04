import { StatusBadge } from '@/components/molecules'
import { TASK_STATUS_LABELS } from '@/lib/status-machine'
import type { TaskHistoryProps } from './types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function TaskHistory({ items }: TaskHistoryProps) {
  if (items.length === 0) {
    return <p className="text-sm text-ink-muted">История пока пуста.</p>
  }

  return (
    <ol className="relative space-y-0 border-l border-line pl-6">
      {items.map((item, index) => (
        <li
          key={item.id}
          className="relative pb-6 last:pb-0 animate-fade-up"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <span className="absolute top-1.5 -left-[1.55rem] size-2.5 rounded-full bg-primary ring-4 ring-paper" />
          <div className="flex flex-wrap items-center gap-2">
            {item.from_status ? (
              <>
                <StatusBadge status={item.from_status} />
                <span className="text-ink-faint">→</span>
              </>
            ) : null}
            <StatusBadge status={item.to_status} />
          </div>
          <p className="mt-1.5 text-sm text-ink">
            {item.changer?.full_name ?? 'Пользователь'}
            {item.from_status
              ? ` сменил статус: ${TASK_STATUS_LABELS[item.from_status]} → ${TASK_STATUS_LABELS[item.to_status]}`
              : ` создал задачу (${TASK_STATUS_LABELS[item.to_status]})`}
          </p>
          {item.comment ? (
            <p className="mt-1 rounded-lg bg-line/40 px-3 py-2 text-sm text-ink-muted">
              {item.comment}
            </p>
          ) : null}
          <time className="mt-1 block text-xs text-ink-faint">
            {formatDate(item.created_at)}
          </time>
        </li>
      ))}
    </ol>
  )
}
