import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/AuthProvider'
import {
  createObject,
  deleteObject,
  getObject,
  listObjects,
  updateObject,
} from './api'
import type { ObjectFormValues } from './schemas'

export function useObjects() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['objects', user?.id],
    queryFn: listObjects,
    enabled: Boolean(user?.id),
  })
}

export function useObject(id: string | undefined) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['objects', id, user?.id],
    queryFn: () => getObject(id!),
    enabled: Boolean(id && user?.id),
  })
}

export function useCreateObject() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: (values: ObjectFormValues) => {
      if (!user) throw new Error('Not authenticated')
      return createObject(values, user.id)
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['objects'] })
    },
  })
}

export function useUpdateObject() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string
      values: ObjectFormValues
    }) => updateObject(id, values),
    onSuccess: (_data, vars) => {
      void qc.invalidateQueries({ queryKey: ['objects'] })
      void qc.invalidateQueries({ queryKey: ['objects', vars.id] })
    },
  })
}

export function useDeleteObject() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: deleteObject,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['objects'] })
    },
  })
}
