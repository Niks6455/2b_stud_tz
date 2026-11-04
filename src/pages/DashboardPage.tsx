import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  TimerReset,
} from 'lucide-react'
import { Button, Spinner } from '@/components/atoms'
import { EmptyState, PageHeader, StatusBadge } from '@/components/molecules'
import { useAuth } from '@/features/auth/AuthProvider'
import { useObjects } from '@/features/objects/hooks'
import { taskLocationState } from '@/features/tasks/navigation'
import { useTasks } from '@/features/tasks/hooks'
import {
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '@/lib/status-machine'
import type { TaskStatus } from '@/shared/types/database'

export function DashboardPage() {
  const { profile } = useAuth()
  const location = useLocation()
  const { data: objects, isLoading: objectsLoading } = useObjects()
  const { data: tasks, isLoading: tasksLoading } = useTasks(
    profile?.role === 'executor' ? { mine: true } : undefined,
  )
  const taskState = taskLocationState(location.pathname)

  const loading = objectsLoading || tasksLoading

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  const taskList = tasks ?? []
  const objectList = objects ?? []
  const counts = Object.fromEntries(
    TASK_STATUSES.map((s) => [s, taskList.filter((t) => t.status === s).length]),
  ) as Record<TaskStatus, number>
  const maxCount = Math.max(1, ...Object.values(counts))
  const needsAction = taskList.filter((t) =>
    profile?.role === 'manager'
      ? t.status === 'review'
      : t.status === 'new' || t.status === 'rework',
  )
  const recent = [...taskList]
    .sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
    )
    .slice(0, 6)

  return (
    <div>
      <PageHeader
        title="Дашборд"
        description="Сводка по стройкам и задачам. Данные обновляются в реальном времени."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-paper-elevated px-2.5 py-1.5 text-xs font-medium text-ink-muted">
              <span className="relative flex size-2">
                <span className="absolute inset-0 animate-ping rounded-full bg-success opacity-60" />
                <span className="relative size-2 rounded-full bg-success" />
              </span>
              Онлайн
            </span>
            <Link to="/board">
              <Button type="button">Открыть канбан</Button>
            </Link>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Объекты"
          value={objectList.length}
          icon={<Building2 className="size-4" />}
        />
        <StatCard
          label="Всего задач"
          value={taskList.length}
          icon={<ClipboardList className="size-4" />}
        />
        <StatCard
          label="Ждут действия"
          value={needsAction.length}
          icon={<TimerReset className="size-4" />}
        />
        <StatCard
          label="Принято"
          value={counts.accepted}
          icon={<CheckCircle2 className="size-4" />}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-xl border border-line bg-paper-elevated p-5 shadow-sm md:p-6">
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="font-display text-xl font-semibold text-ink">
              Распределение статусов
            </h2>
            <Link
              to="/board"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              На доску
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {TASK_STATUSES.map((status) => (
              <div
                key={status}
                className="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-3"
              >
                <span className="truncate text-sm text-ink-muted">
                  {TASK_STATUS_LABELS[status]}
                </span>
                <div className="h-1.5 overflow-hidden bg-line">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${(counts[status] / maxCount) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-right text-sm font-medium tabular-nums text-ink">
                  {counts[status]}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-paper-elevated p-5 shadow-sm md:p-6">
          <h2 className="mb-4 font-display text-xl font-semibold text-ink">
            Требуют внимания
          </h2>
          {needsAction.length === 0 ? (
            <EmptyState
              title="Всё чисто"
              description="Нет задач, ждущих вашего действия."
              className="border-0 bg-transparent py-8"
            />
          ) : (
            <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line">
              {needsAction.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <Link
                    to={`/tasks/${task.id}`}
                    state={taskState}
                    className="group flex items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-primary-soft"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink group-hover:text-primary">
                        {task.title}
                      </p>
                      <p className="truncate text-xs text-ink-muted">
                        {task.object?.name}
                      </p>
                    </div>
                    <StatusBadge status={task.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="mt-3 rounded-xl border border-line bg-paper-elevated p-5 shadow-sm md:p-6">
        <h2 className="mb-4 font-display text-xl font-semibold text-ink">
          Недавние задачи
        </h2>
        {recent.length === 0 ? (
          <p className="text-sm text-ink-muted">Пока нет задач.</p>
        ) : (
          <div className="grid gap-0 overflow-hidden rounded-lg border border-line md:grid-cols-2 md:divide-x md:divide-line">
            {recent.map((task) => (
              <Link
                key={task.id}
                to={`/tasks/${task.id}`}
                state={taskState}
                className="group border-b border-line px-4 py-3 transition-colors last:border-b-0 hover:bg-primary-soft md:odd:border-r-0 md:[&:nth-last-child(-n+2)]:border-b-0"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ink group-hover:text-primary">
                      {task.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {task.object?.name} · {task.assignee?.full_name}
                    </p>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: ReactNode
}) {
  return (
    <div className="rounded-xl border border-line bg-paper-elevated p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
          {label}
        </p>
        <span className="text-ink-faint">{icon}</span>
      </div>
      <p className="font-display text-3xl font-semibold tracking-tight tabular-nums text-ink">
        {value}
      </p>
    </div>
  )
}
