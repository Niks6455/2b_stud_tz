import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button, Spinner } from '@/components/atoms'
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
} from '@/components/molecules'
import {
  ObjectModal,
  TaskList,
  TaskModal,
} from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  useDeleteObject,
  useObject,
} from '@/features/objects/hooks'
import { useTasks } from '@/features/tasks/hooks'
import { mapAppError } from '@/shared/lib/errors'

export function ObjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { profile } = useAuth()
  const isManager = profile?.role === 'manager'

  const { data: object, isLoading, error } = useObject(id)
  const { data: tasks, isLoading: tasksLoading } = useTasks({ objectId: id })
  const deleteObject = useDeleteObject()

  const [editing, setEditing] = useState(false)
  const [creatingTask, setCreatingTask] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    )
  }

  if (error || !object) {
    return (
      <EmptyState
        title="Объект не найден"
        description={error?.message ?? 'Нет доступа или объект удалён.'}
        action={
          <Button onClick={() => navigate('/objects')}>К списку</Button>
        }
      />
    )
  }

  return (
    <div>
      <Link
        to="/objects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Все объекты
      </Link>

      <PageHeader
        title={object.name}
        description={object.address}
        actions={
          isManager ? (
            <>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <Pencil className="size-4" />
                Изменить
              </Button>
              <Button onClick={() => setCreatingTask(true)}>
                <Plus className="size-4" />
                Задача
              </Button>
              <Button
                variant="secondary"
                aria-label="Удалить объект"
                className="border-danger/20 text-danger hover:border-danger/40 hover:bg-danger-soft hover:text-danger"
                onClick={() => setDeleting(true)}
              >
                <Trash2 className="size-4" />
              </Button>
            </>
          ) : null
        }
      />

      {formError ? (
        <p className="mb-4 rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}

      <ObjectModal
        open={editing}
        onClose={() => setEditing(false)}
        mode="edit"
        objectId={object.id}
        defaultValues={{ name: object.name, address: object.address }}
      />

      <TaskModal
        open={creatingTask}
        onClose={() => setCreatingTask(false)}
        defaultObjectId={object.id}
        navigateOnCreate={false}
      />

      <ConfirmDialog
        open={deleting}
        title="Удалить объект?"
        description={`«${object.name}» можно удалить только если на нём нет задач. Действие необратимо.`}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        danger
        loading={deleteObject.isPending}
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          void (async () => {
            try {
              setFormError(null)
              await deleteObject.mutateAsync(object.id)
              setDeleting(false)
              navigate('/objects')
            } catch (e) {
              setDeleting(false)
              setFormError(mapAppError(e, 'Не удалось удалить объект'))
            }
          })()
        }}
      />

      <h2 className="mb-4 font-display text-2xl font-bold text-ink">
        Задачи объекта
      </h2>
      {tasksLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState
          title="Задач пока нет"
          description={
            isManager
              ? 'Создайте первую задачу по этому объекту.'
              : 'Вам пока не назначены задачи на этом объекте.'
          }
          action={
            isManager ? (
              <Button onClick={() => setCreatingTask(true)}>
                <Plus className="size-4" />
                Создать задачу
              </Button>
            ) : null
          }
        />
      ) : (
        <TaskList tasks={tasks} />
      )}
    </div>
  )
}
