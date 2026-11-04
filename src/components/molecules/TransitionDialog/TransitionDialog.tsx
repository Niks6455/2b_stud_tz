import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Button, Textarea } from '@/components/atoms'
import { StatusBadge } from '@/components/molecules/StatusBadge'
import { TASK_STATUS_LABELS } from '@/lib/status-machine'
import type { TransitionDialogProps } from './types'

export function TransitionDialog({
  open,
  taskTitle,
  from,
  to,
  actionLabel,
  commentRequired,
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
  loading,
  danger,
}: TransitionDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  const canConfirm = !commentRequired || comment.trim().length > 0

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-paper-elevated p-6 shadow-2xl shadow-primary/10"
      >
        <p className="text-xs font-semibold tracking-wide text-ink-faint uppercase">
          Смена статуса
        </p>
        <h2 className="mt-1 font-display text-2xl font-semibold tracking-tight text-ink">
          {actionLabel}
        </h2>
        <p className="mt-2 text-sm text-ink-muted">
          Задача: <span className="font-semibold text-ink">{taskTitle}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl bg-primary-soft/50 px-3 py-3">
          <StatusBadge status={from} />
          <span className="text-ink-faint">→</span>
          <StatusBadge status={to} />
          <span className="ml-auto text-xs text-ink-muted">
            {TASK_STATUS_LABELS[from]} → {TASK_STATUS_LABELS[to]}
          </span>
        </div>

        <div className="mt-4">
          <label className="mb-1.5 block text-sm font-medium text-ink-muted">
            Комментарий
            {commentRequired ? (
              <span className="text-danger"> *</span>
            ) : (
              <span className="text-ink-faint"> (необязательно)</span>
            )}
          </label>
          <Textarea
            value={comment}
            onChange={(e) => onCommentChange(e.target.value)}
            placeholder={
              commentRequired
                ? 'Обязательно укажите причину'
                : 'Можно добавить пояснение к переходу'
            }
            autoFocus
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={!canConfirm}
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
