import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation, useNavigate } from 'react-router-dom'
import { Building2, ClipboardList, LayoutDashboard, Search } from 'lucide-react'
import { useObjects } from '@/features/objects/hooks'
import { taskLocationState } from '@/features/tasks/navigation'
import { useTasks } from '@/features/tasks/hooks'
import { cn } from '@/shared/lib/cn'
import type { CommandPaletteProps } from './types'

type Item = {
  id: string
  label: string
  hint: string
  icon: typeof Search
  to: string
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const { data: objects } = useObjects()
  const { data: tasks } = useTasks()

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    const base: Item[] = [
      {
        id: 'nav-dash',
        label: 'Дашборд',
        hint: 'Перейти',
        icon: LayoutDashboard,
        to: '/dashboard',
      },
      {
        id: 'nav-board',
        label: 'Канбан-доска',
        hint: 'Перейти',
        icon: ClipboardList,
        to: '/board',
      },
      {
        id: 'nav-objects',
        label: 'Объекты',
        hint: 'Перейти',
        icon: Building2,
        to: '/objects',
      },
    ]

    const objectItems: Item[] = (objects ?? []).map((o) => ({
      id: `obj-${o.id}`,
      label: o.name,
      hint: o.address,
      icon: Building2,
      to: `/objects/${o.id}`,
    }))

    const taskItems: Item[] = (tasks ?? []).map((t) => ({
      id: `task-${t.id}`,
      label: t.title,
      hint: t.object?.name ?? 'Задача',
      icon: ClipboardList,
      to: `/tasks/${t.id}`,
    }))

    return [...base, ...objectItems, ...taskItems].filter((item) => {
      if (!q) return true
      return (
        item.label.toLowerCase().includes(q) ||
        item.hint.toLowerCase().includes(q)
      )
    })
  }, [objects, tasks, query])

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh] animate-fade-in">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
        aria-label="Закрыть"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-paper-elevated shadow-2xl shadow-primary/10">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 text-ink-faint" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск объектов, задач, страниц…"
            className="h-14 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-ink-faint sm:inline">
            ESC
          </kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {items.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-ink-muted">
              Ничего не найдено
            </li>
          ) : (
            items.slice(0, 12).map((item, index) => {
              const Icon = item.icon
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                      'hover:bg-primary-soft',
                      index === 0 && !query && 'bg-primary-soft/60',
                    )}
                    onClick={() => {
                      navigate(
                        item.to,
                        item.to.startsWith('/tasks/')
                          ? { state: taskLocationState(location.pathname) }
                          : undefined,
                      )
                      onClose()
                    }}
                  >
                    <span className="flex size-8 items-center justify-center rounded-lg bg-paper text-primary">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">
                        {item.label}
                      </span>
                      <span className="block truncate text-xs text-ink-muted">
                        {item.hint}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })
          )}
        </ul>
      </div>
    </div>,
    document.body,
  )
}
