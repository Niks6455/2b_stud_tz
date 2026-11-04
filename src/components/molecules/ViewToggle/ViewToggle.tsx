import { LayoutGrid, List, Table2 } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { TasksViewMode, ViewToggleProps } from './types'

const MODES: {
  value: TasksViewMode
  label: string
  icon: typeof List
}[] = [
  { value: 'list', label: 'Список', icon: List },
  { value: 'grid', label: 'Карточки', icon: LayoutGrid },
  { value: 'table', label: 'Таблица', icon: Table2 },
]

export function ViewToggle({ value, onChange }: ViewToggleProps) {
  return (
    <div
      className="inline-flex rounded-xl border border-line bg-paper-elevated p-1"
      role="group"
      aria-label="Вид отображения"
    >
      {MODES.map((mode) => {
        const Icon = mode.icon
        const active = value === mode.value
        return (
          <button
            key={mode.value}
            type="button"
            title={mode.label}
            aria-pressed={active}
            onClick={() => onChange(mode.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all',
              active
                ? 'bg-primary text-white shadow-sm shadow-primary/25'
                : 'text-ink-muted hover:bg-primary-soft hover:text-ink',
            )}
          >
            <Icon className="size-3.5" />
            <span className="hidden sm:inline">{mode.label}</span>
          </button>
        )
      })}
    </div>
  )
}
