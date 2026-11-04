import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button, Spinner } from '@/components/atoms'
import { EmptyState, PageHeader } from '@/components/molecules'
import { KanbanBoard, TaskModal } from '@/components/organisms'
import { useAuth } from '@/features/auth/AuthProvider'
import { useTasks, useTransitionTask } from '@/features/tasks/hooks'

export function BoardPage() {
  const { profile, user } = useAuth()
  const { data: tasks, isLoading, error } = useTasks(
    profile?.role === 'executor' ? { mine: true } : undefined,
  )
  const transition = useTransitionTask()
  const [creating, setCreating] = useState(false)

  if (!profile || !user) return null

  const isManager = profile.role === 'manager'

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Канбан"
        description={
          isManager
            ? 'Создавайте задачи и двигайте их по статусам.'
            : 'Тяните свои задачи: Новая → В работе → На проверке.'
        }
        actions={
          isManager ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" />
              Создать задачу
            </Button>
          ) : null
        }
      />

      <TaskModal open={creating} onClose={() => setCreating(false)} />

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : error ? (
        <EmptyState title="Ошибка" description={error.message} />
      ) : !tasks || tasks.length === 0 ? (
        <EmptyState
          title="Нет задач"
          description={
            isManager
              ? 'Создайте первую задачу — кнопка сверху.'
              : 'Когда вам назначат задачу, она появится здесь.'
          }
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
        <KanbanBoard
          tasks={tasks}
          role={profile.role}
          userId={user.id}
          busy={transition.isPending}
          onMove={async (taskId, toStatus, comment) => {
            await transition.mutateAsync({ taskId, toStatus, comment })
          }}
        />
      )}
    </div>
  )
}
