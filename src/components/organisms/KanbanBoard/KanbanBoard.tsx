import { useMemo, useState, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { GripVertical } from 'lucide-react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { StatusBadge, TransitionDialog } from '@/components/molecules'
import {
  STATUS_COLUMN_ACCENT,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  canTransitionTo,
  getAvailableActions,
  transitionNeedsComment,
} from '@/lib/status-machine'
import { taskLocationState } from '@/features/tasks/navigation'
import { cn } from '@/shared/lib/cn'
import type { TaskStatus, TaskWithRelations } from '@/shared/types/database'
import type { KanbanBoardProps } from './types'

type ColumnState =
  | 'idle'
  | 'allowed'
  | 'forbidden'
  | 'over-allowed'
  | 'over-forbidden'

function Column({
  status,
  count,
  state,
  children,
}: {
  status: TaskStatus
  count: number
  state: ColumnState
  children: ReactNode
}) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-h-[24rem] min-w-0 flex-col rounded-xl border bg-paper-elevated transition-colors duration-150',
        state === 'idle' && 'border-line',
        state === 'allowed' && 'border-primary/50 bg-primary-soft/40',
        state === 'forbidden' && 'border-line bg-paper opacity-45',
        state === 'over-allowed' && 'border-primary bg-primary-soft',
        state === 'over-forbidden' && 'border-danger/50 bg-danger-soft/40',
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              STATUS_COLUMN_ACCENT[status],
            )}
          />
          <h3 className="truncate text-sm font-medium text-ink">
            {TASK_STATUS_LABELS[status]}
          </h3>
        </div>
        <span className="shrink-0 border border-line px-1.5 py-0.5 text-xs font-medium tabular-nums text-ink-muted">
          {count}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2.5">
        {children}
        {count === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-ink-faint">
            {state === 'allowed' || state === 'over-allowed'
              ? 'Можно отпустить здесь'
              : 'Пусто'}
          </p>
        ) : null}
      </div>
    </div>
  )
}

function CardPreview({ task }: { task: TaskWithRelations }) {
  return (
    <div className="border border-primary bg-paper-elevated p-3 shadow-md">
      <p className="font-semibold text-ink">{task.title}</p>
      <p className="mt-1 truncate text-xs text-ink-muted">
        {task.object?.name ?? 'Объект'}
      </p>
      <div className="mt-2.5 flex items-center gap-2">
        <StatusBadge status={task.status} />
        <span className="min-w-0 truncate text-[11px] text-ink-faint">
          {task.assignee?.full_name ?? '—'}
        </span>
      </div>
    </div>
  )
}

function TaskCard({
  task,
  canDrag,
  isDragging,
}: {
  task: TaskWithRelations
  canDrag: boolean
  isDragging?: boolean
}) {
  const location = useLocation()
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: task.id,
    data: { task },
    disabled: !canDrag,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg border border-line bg-paper-elevated p-3',
        canDrag && 'hover:border-ink/30',
        isDragging && 'border-dashed border-primary/50 bg-primary-soft/50 opacity-40',
      )}
    >
      <div className="flex items-start gap-2">
        <button
          type="button"
          className={cn(
            'mt-0.5 shrink-0 rounded-md p-1 text-ink-faint',
            canDrag
              ? 'cursor-grab touch-none hover:bg-primary-soft hover:text-primary active:cursor-grabbing'
              : 'cursor-not-allowed opacity-35',
          )}
          aria-label={canDrag ? 'Перетащить задачу' : 'Нельзя переместить'}
          disabled={!canDrag}
          {...(canDrag ? { ...listeners, ...attributes } : {})}
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <Link
            to={`/tasks/${task.id}`}
            state={taskLocationState(location.pathname)}
            className="block truncate font-semibold text-ink hover:text-primary"
          >
            {task.title}
          </Link>
          <p className="mt-1 truncate text-xs text-ink-muted">
            {task.object?.name ?? 'Объект'}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <StatusBadge status={task.status} />
            <span className="min-w-0 truncate text-[11px] text-ink-faint">
              {task.assignee?.full_name ?? '—'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function KanbanBoard({
  tasks,
  role,
  userId,
  onMove,
  busy,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [pending, setPending] = useState<{
    task: TaskWithRelations
    to: TaskStatus
    label: string
    needsComment: boolean
    danger: boolean
  } | null>(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  )

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      TASK_STATUSES.map((s) => [s, [] as TaskWithRelations[]]),
    ) as Record<TaskStatus, TaskWithRelations[]>
    for (const task of tasks) map[task.status].push(task)
    return map
  }, [tasks])

  const activeTask = tasks.find((t) => t.id === activeId) ?? null

  const allowedTargets = useMemo(() => {
    if (!activeTask) return new Set<TaskStatus>()
    const isAssignee = activeTask.assignee_id === userId
    return new Set(
      getAvailableActions(activeTask.status, role, isAssignee).map((a) => a.to),
    )
  }, [activeTask, role, userId])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id))
    setError(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const taskId = String(event.active.id)
    const to = event.over?.id as TaskStatus | undefined
    setActiveId(null)
    setOverId(null)

    if (!to || !TASK_STATUSES.includes(to)) return

    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === to) return

    const isAssignee = task.assignee_id === userId
    if (!canTransitionTo(task.status, to, role, isAssignee)) {
      setError(
        `Сюда нельзя: из «${TASK_STATUS_LABELS[task.status]}» в «${TASK_STATUS_LABELS[to]}»`,
      )
      return
    }

    const action = getAvailableActions(task.status, role, isAssignee).find(
      (a) => a.to === to,
    )
    setPending({
      task,
      to,
      label: action?.label ?? 'Сменить статус',
      needsComment: transitionNeedsComment(task.status, to, role, isAssignee),
      danger: action?.variant === 'danger',
    })
    setComment('')
  }

  const columnState = (status: TaskStatus): ColumnState => {
    if (!activeTask) return 'idle'
    if (status === activeTask.status) return 'idle'
    const allowed = allowedTargets.has(status)
    const isOver = overId === status
    if (allowed) return isOver ? 'over-allowed' : 'allowed'
    return isOver ? 'over-forbidden' : 'forbidden'
  }

  return (
    <div className="min-w-0">
      <p className="mb-4 border border-line bg-paper px-3 py-2 text-sm text-ink-muted">
        Тяните задачу за{' '}
        <GripVertical className="inline size-3.5 align-text-bottom text-primary" />
        . Доступные колонки подсвечиваются синим, после дропа — подтверждение.
      </p>

      {error ? (
        <p className="mb-3 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={(e) => setOverId(e.over ? String(e.over.id) : null)}
        onDragEnd={handleDragEnd}
        onDragCancel={() => {
          setActiveId(null)
          setOverId(null)
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TASK_STATUSES.map((status) => (
            <Column
              key={status}
              status={status}
              count={byStatus[status].length}
              state={columnState(status)}
            >
              {byStatus[status].map((task) => {
                const canDrag =
                  !busy &&
                  getAvailableActions(
                    task.status,
                    role,
                    task.assignee_id === userId,
                  ).length > 0
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    canDrag={canDrag}
                    isDragging={activeId === task.id}
                  />
                )
              })}
            </Column>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? (
            <div className="w-[240px] cursor-grabbing">
              <CardPreview task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TransitionDialog
        open={Boolean(pending)}
        taskTitle={pending?.task.title ?? ''}
        from={pending?.task.status ?? 'new'}
        to={pending?.to ?? 'new'}
        actionLabel={pending?.label ?? 'Подтвердить'}
        commentRequired={pending?.needsComment ?? false}
        comment={comment}
        onCommentChange={setComment}
        danger={pending?.danger}
        loading={busy}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return
          void onMove(pending.task.id, pending.to, comment.trim() || undefined)
            .then(() => {
              setPending(null)
              setComment('')
              setError(null)
            })
            .catch((e: unknown) => {
              setError(
                e instanceof Error ? e.message : 'Не удалось сменить статус',
              )
            })
        }}
      />
    </div>
  )
}
