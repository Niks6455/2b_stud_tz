import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'
import { Button, Textarea } from '@/components/atoms'
import type { ConfirmDialogProps } from './types'

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  danger,
  commentRequired,
  comment = '',
  onCommentChange,
  onConfirm,
  onCancel,
  loading,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onCancel])

  if (!open) return null

  const canConfirm = !commentRequired || comment.trim().length > 0

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-line bg-paper-elevated p-6 shadow-xl"
      >
        {danger ? (
          <div className="mb-4 flex size-10 items-center justify-center rounded-xl bg-danger-soft text-danger">
            <AlertTriangle className="size-5" />
          </div>
        ) : null}
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
        {commentRequired ? (
          <div className="mt-4">
            <Textarea
              value={comment}
              onChange={(e) => onCommentChange?.(e.target.value)}
              placeholder="Комментарий обязателен"
              autoFocus
            />
          </div>
        ) : null}
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={!canConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
