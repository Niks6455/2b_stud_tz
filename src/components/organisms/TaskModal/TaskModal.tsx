import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Modal } from '@/components/molecules'
import { TaskForm } from '@/components/organisms/TaskForm'
import { useObjects } from '@/features/objects/hooks'
import { taskLocationState } from '@/features/tasks/navigation'
import {
  useCreateTask,
  useExecutors,
  useUpdateTask,
} from '@/features/tasks/hooks'
import { mapAppError } from '@/shared/lib/errors'
import type { TaskModalProps } from './types'

export function TaskModal({
  open,
  onClose,
  mode = 'create',
  taskId,
  defaultObjectId,
  defaultValues,
  onSuccess,
  navigateOnCreate = true,
}: TaskModalProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: objects } = useObjects()
  const { data: executors } = useExecutors()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const [error, setError] = useState<string | null>(null)

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={mode === 'create' ? 'Новая задача' : 'Редактировать задачу'}
      description={
        mode === 'create'
          ? defaultObjectId
            ? 'Задача будет создана на этом объекте.'
            : 'Укажите объект, исполнителя и описание работы.'
          : 'Измените поля задачи и сохраните.'
      }
    >
      {error ? (
        <p className="mb-3 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      ) : null}

      {!objects?.length ? (
        <p className="rounded-lg border border-warning/25 bg-warning-soft px-3 py-2 text-sm text-warning">
          Сначала создайте объект на странице «Объекты».
        </p>
      ) : !executors?.length ? (
        <p className="rounded-lg border border-warning/25 bg-warning-soft px-3 py-2 text-sm text-warning">
          Нет исполнителей. Добавьте пользователей с ролью executor в Supabase.
        </p>
      ) : (
        <TaskForm
          key={`${mode}-${taskId ?? 'new'}-${defaultObjectId ?? 'any'}-${String(open)}`}
          objects={objects}
          executors={executors}
          lockObjectId={Boolean(defaultObjectId)}
          defaultValues={{
            ...defaultValues,
            ...(defaultObjectId ? { object_id: defaultObjectId } : {}),
          }}
          submitLabel={mode === 'create' ? 'Создать задачу' : 'Сохранить'}
          onCancel={onClose}
          onSubmit={async (values) => {
            setError(null)
            try {
              if (mode === 'create') {
                const task = await createTask.mutateAsync(values)
                onClose()
                onSuccess?.(task.id)
                if (navigateOnCreate) {
                  navigate(`/tasks/${task.id}`, {
                    state: taskLocationState(location.pathname),
                  })
                }
                return
              }
              if (!taskId) throw new Error('Не указан id задачи')
              await updateTask.mutateAsync({ id: taskId, values })
              onClose()
              onSuccess?.(taskId)
            } catch (e) {
              setError(mapAppError(e, 'Не удалось сохранить задачу'))
            }
          }}
        />
      )}
    </Modal>
  )
}
