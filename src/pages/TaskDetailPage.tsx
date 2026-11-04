import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import { Button, Spinner } from '@/components/atoms'
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '@/components/molecules'
import {
  TaskActions,
  TaskHistory,
  TaskModal,
} from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { backToFromPath } from '@/features/tasks/navigation'
import {
  useDeleteTask,
  useTask,
  useTaskHistory,
  useTransitionTask,
} from '@/features/tasks/hooks'
import { canEditTaskFields } from '@/lib/status-machine'
import { mapAppError } from '@/shared/lib/errors'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, user } = useAuth()
  const { data: task, isLoading, error } = useTask(id)
  const { data: history, isLoading: historyLoading } = useTaskHistory(id)
  const deleteTask = useDeleteTask()
  const transition = useTransitionTask()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const fromPath = (location.state as { from?: string } | null)?.from

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error || !task || !profile) {
    return (
      <EmptyState
        title="Задача не найдена"
        description={
          error?.message ??
          'Нет доступа: исполнитель видит только свои задачи.'
        }
        action={
          <Button onClick={() => navigate('/my-tasks')}>К задачам</Button>
        }
      />
    )
  }

  const isManager = profile.role === 'manager'
  const isAssignee = task.assignee_id === user?.id
  const editable = canEditTaskFields(task.status, profile.role)
  const backTo = backToFromPath(fromPath, {
    id: task.object_id,
    name: task.object?.name,
  })

  return (
    <div>
      <Link
        to={backTo.to}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        {backTo.label}
      </Link>

      <PageHeader
        title={task.title}
        description={task.description || 'Без описания'}
        actions={
          isManager ? (
            <>
              {editable ? (
                <Button variant="secondary" onClick={() => setEditing(true)}>
                  <Pencil className="size-4" />
                  Изменить
                </Button>
              ) : null}
              <Button
                variant="secondary"
                aria-label="Удалить задачу"
                className="border-danger/20 text-danger hover:border-danger/40 hover:bg-danger-soft hover:text-danger"
                onClick={() => setDeleting(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          ) : null
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Meta label="Статус">
          <StatusBadge status={task.status} />
        </Meta>
        <Meta label="Объект">{task.object?.name ?? '—'}</Meta>
        <Meta label="Исполнитель">
          {task.assignee?.full_name ?? '—'}
        </Meta>
        <Meta label="Автор / создана">
          {task.author?.full_name ?? '—'}
          <span className="mt-0.5 block text-xs text-ink-faint">
            {formatDate(task.created_at)}
          </span>
        </Meta>
      </div>

      {actionError ? (
        <p className="mb-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {actionError}
        </p>
      ) : null}

      <TaskModal
        open={editing && editable}
        onClose={() => setEditing(false)}
        mode="edit"
        taskId={task.id}
        defaultValues={{
          title: task.title,
          description: task.description,
          object_id: task.object_id,
          assignee_id: task.assignee_id,
        }}
      />

      <ConfirmDialog
        open={deleting}
        title="Удалить задачу?"
        description={`«${task.title}» будет удалена без возможности восстановления.`}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        danger
        loading={deleteTask.isPending}
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          void (async () => {
            try {
              setActionError(null)
              await deleteTask.mutateAsync(task.id)
              setDeleting(false)
              navigate(
                task.object_id ? `/objects/${task.object_id}` : '/objects',
              )
            } catch (e) {
              setDeleting(false)
              setActionError(mapAppError(e, 'Не удалось удалить задачу'))
            }
          })()
        }}
      />

      <section className="mb-10 rounded-2xl border border-line bg-paper-elevated p-5 shadow-sm md:p-6">
        <h2 className="mb-4 font-display text-2xl font-bold">Действия</h2>
        <TaskActions
          status={task.status}
          role={profile.role}
          isAssignee={isAssignee}
          loading={transition.isPending}
          onAction={async (to, comment) => {
            setActionError(null)
            try {
              await transition.mutateAsync({
                taskId: task.id,
                toStatus: to,
                comment,
              })
            } catch (e) {
              setActionError(mapAppError(e, 'Переход статуса запрещён'))
            }
          }}
        />
      </section>

      <section className="rounded-2xl border border-line bg-paper-elevated p-5 shadow-sm md:p-6">
        <h2 className="mb-5 font-display text-2xl font-bold">
          История статусов
        </h2>
        {historyLoading ? (
          <Spinner className="mx-auto" />
        ) : (
          <TaskHistory items={history ?? []} />
        )}
      </section>
    </div>
  )
}

function Meta({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="rounded-xl border border-line bg-paper-elevated px-4 py-3 shadow-sm">
      <p className="text-xs font-medium tracking-wide text-ink-faint uppercase">
        {label}
      </p>
      <div className="mt-1.5 text-sm font-medium text-ink">{children}</div>
    </div>
  )
}
