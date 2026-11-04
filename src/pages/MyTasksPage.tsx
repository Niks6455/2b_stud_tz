import { useMemo, useState } from 'react'
import { Plus, UserRound } from 'lucide-react'
import { Button, Spinner } from '@/components/atoms'
import {
  DateFilter,
  EmptyState,
  FilterMenu,
  matchesDateFilter,
  PageHeader,
  SearchInput,
  StatusFilter,
  ViewToggle,
  type DateFilterValue,
  type StatusFilterValue,
  type TasksViewMode,
} from '@/components/molecules'
import { TaskModal, TaskViews } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { useExecutors, useTasks } from '@/features/tasks/hooks'

export function MyTasksPage() {
  const { profile } = useAuth()
  const isManager = profile?.role === 'manager'
  const { data: tasks, isLoading, error } = useTasks(
    isManager ? undefined : { mine: true },
  )
  const { data: executors } = useExecutors()

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilterValue>('all')
  const [assigneeId, setAssigneeId] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<DateFilterValue>({
    preset: 'all',
  })
  const [view, setView] = useState<TasksViewMode>('list')
  const [creating, setCreating] = useState(false)

  const assigneeOptions = useMemo(
    () => [
      { value: 'all', label: 'Все исполнители' },
      ...(executors ?? []).map((e) => ({
        value: e.id,
        label: e.full_name,
        hint: e.email,
        leading: (
          <span className="flex size-6 items-center justify-center rounded-full bg-primary-soft text-[10px] font-bold text-primary">
            {e.full_name
              .split(' ')
              .map((p) => p[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </span>
        ),
      })),
    ],
    [executors],
  )

  const filtered = useMemo(() => {
    if (!tasks) return []
    const q = query.trim().toLowerCase()
    return tasks.filter((t) => {
      if (status !== 'all' && t.status !== status) return false
      if (assigneeId !== 'all' && t.assignee_id !== assigneeId) return false
      if (!matchesDateFilter(t.created_at, dateFilter)) return false
      if (!q) return true
      return (
        t.title.toLowerCase().includes(q) ||
        t.object?.name?.toLowerCase().includes(q) ||
        t.assignee?.full_name?.toLowerCase().includes(q)
      )
    })
  }, [tasks, query, status, assigneeId, dateFilter])

  const hasFilters =
    status !== 'all' ||
    assigneeId !== 'all' ||
    dateFilter.preset !== 'all' ||
    Boolean(query)

  return (
    <div className="animate-fade-up">
      <PageHeader
        title={isManager ? 'Все задачи' : 'Мои задачи'}
        description={
          isManager
            ? 'Создавайте задачи, фильтруйте и переключайте вид.'
            : 'Ваши задачи — поиск, даты и удобный вид.'
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <ViewToggle value={view} onChange={setView} />
            {isManager ? (
              <Button onClick={() => setCreating(true)}>
                <Plus className="size-4" />
                Создать задачу
              </Button>
            ) : null}
          </div>
        }
      />

      <TaskModal open={creating} onClose={() => setCreating(false)} />

      <div className="mb-4 grid items-center gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Поиск по названию или объекту"
        />
        <StatusFilter value={status} onChange={setStatus} />
        {isManager ? (
          <FilterMenu
            value={assigneeId}
            onChange={setAssigneeId}
            options={assigneeOptions}
            icon={<UserRound className="size-3.5" />}
            placeholder="Все исполнители"
            className="sm:max-w-none"
          />
        ) : null}
        <DateFilter value={dateFilter} onChange={setDateFilter} />
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          Найдено:{' '}
          <span className="font-semibold text-ink">{filtered.length}</span>
        </p>
        {hasFilters ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              setStatus('all')
              setAssigneeId('all')
              setDateFilter({ preset: 'all' })
            }}
          >
            Сбросить фильтры
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <EmptyState title="Ошибка" description={error.message} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="Задач не найдено"
          description="Попробуйте изменить фильтры или создайте новую задачу."
          action={
            isManager ? (
              <Button onClick={() => setCreating(true)}>
                <Plus className="size-4" />
                Создать задачу
              </Button>
            ) : null
          }
        />
      ) : (
        <TaskViews tasks={filtered} mode={view} />
      )}
    </div>
  )
}
