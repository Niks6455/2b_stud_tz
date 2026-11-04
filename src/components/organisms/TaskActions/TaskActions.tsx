import { useState } from 'react'
import { Button } from '@/components/atoms'
import { ConfirmDialog } from '@/components/molecules'
import {
  getAvailableActions,
  type TaskAction,
} from '@/lib/status-machine'
import type { TaskActionsProps } from './types'

export function TaskActions({
  status,
  role,
  isAssignee,
  loading,
  onAction,
}: TaskActionsProps) {
  const actions = getAvailableActions(status, role, isAssignee)
  const [pending, setPending] = useState<TaskAction | null>(null)
  const [comment, setComment] = useState('')

  if (actions.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        Нет доступных действий в текущем статусе.
      </p>
    )
  }

  const handleClick = (action: TaskAction) => {
    if (action.requiresComment) {
      setPending(action)
      setComment('')
      return
    }
    void onAction(action.to)
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => (
          <Button
            key={action.to}
            variant={action.variant}
            loading={loading}
            onClick={() => handleClick(action)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.label ?? ''}
        description="Укажите причину возврата на доработку."
        confirmLabel="Вернуть"
        danger
        commentRequired
        comment={comment}
        onCommentChange={setComment}
        loading={loading}
        onCancel={() => setPending(null)}
        onConfirm={() => {
          if (!pending) return
          void Promise.resolve(onAction(pending.to, comment)).then(() => {
            setPending(null)
            setComment('')
          })
        }}
      />
    </>
  )
}
