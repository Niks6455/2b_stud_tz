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
  return useQuery({
    queryKey: ['objects'],
    queryFn: listObjects,
  })
}

export function useObject(id: string | undefined) {
  return useQuery({
    queryKey: ['objects', id],
    queryFn: () => getObject(id!),
    enabled: Boolean(id),
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
