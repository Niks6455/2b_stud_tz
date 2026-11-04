import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import type { TaskStatus } from '@/shared/types/database'
import {
  createTask,
  deleteTask,
  getTask,
  listExecutors,
  listTaskHistory,
  listTasks,
  transitionTask,
  updateTask,
} from './api'
import type { TaskFormValues } from './schemas'

export function useTasks(filters?: { objectId?: string; mine?: boolean }) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['tasks', filters, user?.id],
    queryFn: () =>
      listTasks({
        objectId: filters?.objectId,
        assigneeId: filters?.mine ? user?.id : undefined,
      }),
  })
}

export function useTask(id: string | undefined) {
  return useQuery({
    queryKey: ['tasks', 'detail', id],
    queryFn: () => getTask(id!),
    enabled: Boolean(id),
  })
}

export function useTaskHistory(taskId: string | undefined) {
  return useQuery({
    queryKey: ['tasks', 'history', taskId],
    queryFn: () => listTaskHistory(taskId!),
    enabled: Boolean(taskId),
  })
}

export function useExecutors() {
  return useQuery({
    queryKey: ['executors'],
    queryFn: listExecutors,
  })
}

function invalidateTaskQueries(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['tasks'] })
  void qc.invalidateQueries({ queryKey: ['objects'] })
}

export function useCreateTask() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (values: TaskFormValues) => {
      if (!user) throw new Error('Not authenticated')
      return createTask(values, user.id)
    },
    onSuccess: () => invalidateTaskQueries(qc),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: Partial<TaskFormValues>
    }) => updateTask(id, values),
    onSuccess: (_data, vars) => {
      invalidateTaskQueries(qc)
      void qc.invalidateQueries({ queryKey: ['tasks', 'detail', vars.id] })
    },
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => invalidateTaskQueries(qc),
  })
}

export function useTransitionTask() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      taskId,
      toStatus,
      comment,
    }: {
      taskId: string
      toStatus: TaskStatus
      comment?: string
    }) => transitionTask(taskId, toStatus, comment),
    onSuccess: (_data, vars) => {
      invalidateTaskQueries(qc)
      void qc.invalidateQueries({
        queryKey: ['tasks', 'detail', vars.taskId],
      })
      void qc.invalidateQueries({
        queryKey: ['tasks', 'history', vars.taskId],
      })
    },
  })
}
