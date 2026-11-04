import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { ModalProps } from './types'

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      <button
        type="button"
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={cn(
          'relative z-10 flex max-h-[min(90vh,44rem)] w-full flex-col overflow-hidden rounded-2xl border border-line bg-paper-elevated shadow-lg',
          size === 'md' && 'max-w-lg',
          size === 'lg' && 'max-w-2xl',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-5 py-4 md:px-6">
          <div className="min-w-0">
            <h2
              id="modal-title"
              className="font-display text-2xl font-semibold tracking-tight text-ink"
            >
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-sm text-ink-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ink-faint transition-colors hover:bg-line hover:text-ink"
            aria-label="Закрыть"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-4 md:px-6">{children}</div>
        {footer ? (
          <div className="shrink-0 border-t border-line px-5 py-4 md:px-6">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
