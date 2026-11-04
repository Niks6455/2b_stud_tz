import { useEffect, useId, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronDown } from 'lucide-react'
import { Button, Input } from '@/components/atoms'
import { cn } from '@/shared/lib/cn'
import type { DateFilterProps, DateFilterValue, DatePreset } from './types'

const PRESETS: { value: DatePreset; label: string }[] = [
  { value: 'all', label: 'Любая дата' },
  { value: 'today', label: 'Сегодня' },
  { value: 'week', label: 'За 7 дней' },
  { value: 'month', label: 'За 30 дней' },
  { value: 'custom', label: 'Свой период' },
]

function labelOf(value: DateFilterValue) {
  if (value.preset === 'custom' && (value.from || value.to)) {
    const from = value.from
      ? new Date(value.from).toLocaleDateString('ru-RU')
      : '…'
    const to = value.to ? new Date(value.to).toLocaleDateString('ru-RU') : '…'
    return `${from} — ${to}`
  }
  return PRESETS.find((p) => p.value === value.preset)?.label ?? 'Дата'
}

export function DateFilter({ value, onChange, className }: DateFilterProps) {
  const [open, setOpen] = useState(false)
  const [draftFrom, setDraftFrom] = useState(value.from ?? '')
  const [draftTo, setDraftTo] = useState(value.to ?? '')
  const rootRef = useRef<HTMLDivElement>(null)
  const listId = useId()

  useEffect(() => {
    setDraftFrom(value.from ?? '')
    setDraftTo(value.to ?? '')
  }, [value.from, value.to])

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
          <CalendarDays className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1 truncate">{labelOf(value)}</span>
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
          className="absolute top-[calc(100%+0.4rem)] left-0 z-40 w-[min(100vw-2rem,20rem)] origin-top animate-fade-up rounded-2xl border border-line/80 bg-paper-elevated/95 p-1.5 shadow-xl shadow-primary/10 backdrop-blur-xl"
        >
          {PRESETS.map((preset) => {
            const isActive = value.preset === preset.value
            return (
              <button
                key={preset.value}
                type="button"
                onClick={() => {
                  if (preset.value === 'custom') {
                    onChange({
                      preset: 'custom',
                      from: draftFrom || undefined,
                      to: draftTo || undefined,
                    })
                    return
                  }
                  onChange({ preset: preset.value })
                  setOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors',
                  isActive
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'text-ink hover:bg-primary-soft',
                )}
              >
                <span className="flex-1 font-medium">{preset.label}</span>
                {isActive ? <Check className="size-4" /> : null}
              </button>
            )
          })}

          {value.preset === 'custom' ? (
            <div className="mt-1 space-y-2 rounded-xl border border-line bg-paper p-2.5">
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  С
                </label>
                <Input
                  type="date"
                  value={draftFrom}
                  onChange={(e) => setDraftFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-muted">
                  По
                </label>
                <Input
                  type="date"
                  value={draftTo}
                  onChange={(e) => setDraftTo(e.target.value)}
                />
              </div>
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  onChange({
                    preset: 'custom',
                    from: draftFrom || undefined,
                    to: draftTo || undefined,
                  })
                  setOpen(false)
                }}
              >
                Применить период
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

export function matchesDateFilter(
  isoDate: string,
  filter: DateFilterValue,
): boolean {
  if (filter.preset === 'all') return true

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return true

  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  if (filter.preset === 'today') {
    return date >= startOfToday
  }

  if (filter.preset === 'week') {
    const from = new Date(startOfToday)
    from.setDate(from.getDate() - 6)
    return date >= from
  }

  if (filter.preset === 'month') {
    const from = new Date(startOfToday)
    from.setDate(from.getDate() - 29)
    return date >= from
  }

  if (filter.from) {
    const from = new Date(filter.from)
    from.setHours(0, 0, 0, 0)
    if (date < from) return false
  }
  if (filter.to) {
    const to = new Date(filter.to)
    to.setHours(23, 59, 59, 999)
    if (date > to) return false
  }
  return Boolean(filter.from || filter.to)
}
