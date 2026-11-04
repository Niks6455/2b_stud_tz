import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarDays,
  MapPin,
  UserRound,
} from 'lucide-react'
import { StatusBadge } from '@/components/molecules'
import { TaskList } from '@/components/organisms/TaskList'
import { taskLocationState } from '@/features/tasks/navigation'
import { cn } from '@/shared/lib/cn'
import type { TaskStatus, TaskWithRelations } from '@/shared/types/database'
import type { TaskViewsProps } from './types'

type SortKey = 'title' | 'object' | 'assignee' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

const STATUS_ORDER: Record<TaskStatus, number> = {
  new: 0,
  in_progress: 1,
  review: 2,
  rework: 3,
  accepted: 4,
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function sortValue(task: TaskWithRelations, key: SortKey): string | number {
  switch (key) {
    case 'title':
      return task.title.toLowerCase()
    case 'object':
      return (task.object?.name ?? '').toLowerCase()
    case 'assignee':
      return (task.assignee?.full_name ?? '').toLowerCase()
    case 'status':
      return STATUS_ORDER[task.status]
    case 'created_at':
      return new Date(task.created_at).getTime()
  }
}

function SortHeader({
  label,
  column,
  active,
  dir,
  onSort,
}: {
  label: string
  column: SortKey
  active: boolean
  dir: SortDir
  onSort: (key: SortKey) => void
}) {
  const Icon = !active ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown

  return (
    <th className="px-4 py-3">
      <button
        type="button"
        onClick={() => onSort(column)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md transition-colors',
          active
            ? 'text-primary'
            : 'text-ink-muted hover:text-ink',
        )}
      >
        {label}
        <Icon className="size-3.5 shrink-0 opacity-70" />
      </button>
    </th>
  )
}

function TasksTable({ tasks }: { tasks: TaskWithRelations[] }) {
  const location = useLocation()
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const sorted = useMemo(() => {
    const next = [...tasks]
    next.sort((a, b) => {
      const av = sortValue(a, sortKey)
      const bv = sortValue(b, sortKey)
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return next
  }, [tasks, sortKey, sortDir])

  const onSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'created_at' || key === 'status' ? 'desc' : 'asc')
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-paper-elevated">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs font-medium tracking-wide text-ink-muted uppercase">
            <tr>
              <SortHeader
                label="Задача"
                column="title"
                active={sortKey === 'title'}
                dir={sortDir}
                onSort={onSort}
              />
              <SortHeader
                label="Объект"
                column="object"
                active={sortKey === 'object'}
                dir={sortDir}
                onSort={onSort}
              />
              <SortHeader
                label="Исполнитель"
                column="assignee"
                active={sortKey === 'assignee'}
                dir={sortDir}
                onSort={onSort}
              />
              <SortHeader
                label="Статус"
                column="status"
                active={sortKey === 'status'}
                dir={sortDir}
                onSort={onSort}
              />
              <SortHeader
                label="Создана"
                column="created_at"
                active={sortKey === 'created_at'}
                dir={sortDir}
                onSort={onSort}
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {sorted.map((task) => (
              <tr
                key={task.id}
                className="transition-colors hover:bg-primary-soft"
              >
                <td className="px-4 py-3">
                  <Link
                    to={`/tasks/${task.id}`}
                    state={taskLocationState(location.pathname)}
                    className="font-semibold text-ink hover:text-primary"
                  >
                    {task.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {task.object?.name ?? '—'}
                </td>
                <td className="px-4 py-3 text-ink-muted">
                  {task.assignee?.full_name ?? '—'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={task.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-faint">
                  <span className="inline-flex items-center gap-1">
                    <CalendarDays className="size-3.5" />
                    {formatDateTime(task.created_at)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function TaskViews({ tasks, mode }: TaskViewsProps) {
  const location = useLocation()

  if (mode === 'list') {
    return <TaskList tasks={tasks} />
  }

  if (mode === 'grid') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            to={`/tasks/${task.id}`}
            state={taskLocationState(location.pathname)}
            className="group rounded-xl border border-line bg-paper-elevated p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:bg-primary-soft/40 hover:shadow-md"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <StatusBadge status={task.status} />
              <span className="text-[11px] text-ink-faint">
                {formatDate(task.created_at)}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight text-ink transition-colors group-hover:text-primary">
              {task.title}
            </h3>
            {task.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
                {task.description}
              </p>
            ) : null}
            <div className="mt-4 space-y-1.5 text-xs text-ink-muted">
              <p className="flex items-center gap-1.5 truncate">
                <MapPin className="size-3.5 shrink-0 text-cyan" />
                {task.object?.name ?? 'Объект'}
              </p>
              <p className="flex items-center gap-1.5 truncate">
                <UserRound className="size-3.5 shrink-0 text-primary" />
                {task.assignee?.full_name ?? 'Без исполнителя'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    )
  }

  return <TasksTable tasks={tasks} />
}
