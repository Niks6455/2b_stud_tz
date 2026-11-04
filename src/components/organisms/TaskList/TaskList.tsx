import { Link, useLocation } from 'react-router-dom'
import { StatusBadge } from '@/components/molecules'
import { taskLocationState } from '@/features/tasks/navigation'
import type { TaskListProps } from './types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(value))
}

export function TaskList({ tasks }: TaskListProps) {
  const location = useLocation()

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper-elevated shadow-sm">
      <ul className="divide-y divide-line">
        {tasks.map((task) => (
          <li key={task.id}>
            <Link
              to={`/tasks/${task.id}`}
              state={taskLocationState(location.pathname)}
              className="group flex min-h-[4.25rem] flex-col justify-center gap-2 px-4 py-3.5 transition-colors hover:bg-primary-soft sm:flex-row sm:items-center sm:justify-between sm:px-5"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-ink transition-colors group-hover:text-primary">
                  {task.title}
                </p>
                <p className="mt-0.5 truncate text-sm text-ink-muted">
                  {task.object?.name ?? 'Объект'}
                  {task.assignee ? ` · ${task.assignee.full_name}` : null}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={task.status} />
                <span className="text-xs text-ink-faint">
                  {formatDate(task.created_at)}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
