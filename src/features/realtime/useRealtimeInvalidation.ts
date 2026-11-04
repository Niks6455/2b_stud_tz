import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useRealtimeInvalidation() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel('crm-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks' },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['tasks'] })
          void queryClient.invalidateQueries({ queryKey: ['objects'] })
        },
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'objects' },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['objects'] })
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'task_status_history' },
        () => {
          void queryClient.invalidateQueries({ queryKey: ['tasks'] })
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [queryClient])
}
