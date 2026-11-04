import { useEffect, useId, useRef, useState } from 'react'
import { Check, ChevronDown, ListFilter } from 'lucide-react'
import {
  STATUS_COLUMN_ACCENT,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
} from '@/lib/status-machine'
import { cn } from '@/shared/lib/cn'
import type { StatusFilterProps, StatusFilterValue } from './types'

const OPTIONS: { value: StatusFilterValue; label: string }[] = [
  { value: 'all', label: 'Все статусы' },
  ...TASK_STATUSES.map((status) => ({
    value: status as StatusFilterValue,
    label: TASK_STATUS_LABELS[status],
  })),
]

export function StatusFilter({ value, onChange, className }: StatusFilterProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = OPTIONS.find((o) => o.value === value) ?? OPTIONS[0]

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('mousedown', onPointer)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onPointer)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className={cn('relative w-full', className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex h-10 w-full items-center gap-2 rounded-lg border bg-paper-elevated px-3 text-left text-sm font-medium text-ink',
          'transition-colors duration-150 hover:border-ink/25',
          open ? 'border-primary ring-1 ring-primary/25' : 'border-line',
        )}
      >
        <span className="flex size-4 shrink-0 items-center justify-center text-ink-faint">
          <ListFilter className="size-3.5" />
        </span>
        {value !== 'all' ? (
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              STATUS_COLUMN_ACCENT[value],
            )}
          />
        ) : null}
        <span className="min-w-0 flex-1 truncate">{selected.label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-faint transition-transform duration-200',
            open && 'rotate-180 text-primary',
          )}
        />
      </button>

      {open ? (
        <div
          id={listId}
          role="listbox"
          className="absolute top-[calc(100%+0.4rem)] left-0 z-40 w-full min-w-[14rem] origin-top animate-fade-up overflow-hidden rounded-2xl border border-line/80 bg-paper-elevated/95 p-1.5 shadow-xl shadow-primary/10 backdrop-blur-xl"
        >
          {OPTIONS.map((option) => {
            const isActive = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isActive}
                onClick={() => {
                  onChange(option.value)
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'text-ink hover:bg-primary-soft',
                )}
              >
                {option.value === 'all' ? (
                  <span
                    className={cn(
                      'flex size-5 items-center justify-center rounded-md text-[10px] font-bold',
                      isActive ? 'bg-white/20' : 'bg-line text-ink-muted',
                    )}
                  >
                    Все
                  </span>
                ) : (
                  <span
                    className={cn(
                      'size-2.5 rounded-full ring-2',
                      STATUS_COLUMN_ACCENT[option.value],
                      isActive ? 'ring-white/40' : 'ring-transparent',
                    )}
                  />
                )}
                <span className="min-w-0 flex-1 font-medium">{option.label}</span>
                {isActive ? <Check className="size-4 shrink-0" /> : null}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
