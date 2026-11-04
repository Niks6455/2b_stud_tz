import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import type { FilterMenuProps } from './types'

export function FilterMenu<T extends string>({
  value,
  options,
  onChange,
  icon,
  placeholder = 'Выберите',
  className,
}: FilterMenuProps<T>) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{
    top: number
    left: number
    width: number
  } | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const listId = useId()
  const selected = options.find((o) => o.value === value)

  useLayoutEffect(() => {
    if (!open || !rootRef.current) return

    const update = () => {
      const rect = rootRef.current!.getBoundingClientRect()
      const menuHeight = Math.min(288, options.length * 52 + 16)
      const spaceBelow = window.innerHeight - rect.bottom - 12
      const openUp = spaceBelow < menuHeight && rect.top > spaceBelow
      setCoords({
        top: openUp ? rect.top - menuHeight - 6 : rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 240),
      })
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, options.length])

  useEffect(() => {
    if (!open) return
    const onPointer = (e: MouseEvent) => {
      const target = e.target as Node
      if (rootRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setOpen(false)
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
          'transition-colors duration-150',
          'hover:border-ink/25',
          open ? 'border-primary ring-1 ring-primary/25' : 'border-line',
        )}
      >
        {icon ? (
          <span className="flex size-6 shrink-0 items-center justify-center text-ink-faint">
            {icon}
          </span>
        ) : null}
        {selected?.leading}
        <span className="min-w-0 flex-1 truncate">
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-ink-faint transition-transform duration-200',
            open && 'rotate-180 text-primary',
          )}
        />
      </button>

      {open && coords
        ? createPortal(
            <div
              ref={menuRef}
              id={listId}
              role="listbox"
              style={{
                position: 'fixed',
                top: coords.top,
                left: coords.left,
                width: coords.width,
              }}
              className="z-[60] max-h-72 overflow-y-auto rounded-xl border border-line bg-paper-elevated p-1 shadow-md"
            >
              {options.map((option) => {
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
                      'flex w-full items-center gap-2.5 px-2.5 py-2 text-left text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-ink hover:bg-paper',
                    )}
                  >
                    {option.leading}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">
                        {option.label}
                      </span>
                      {option.hint ? (
                        <span
                          className={cn(
                            'block truncate text-xs',
                            isActive ? 'text-white/75' : 'text-ink-muted',
                          )}
                        >
                          {option.hint}
                        </span>
                      ) : null}
                    </span>
                    {isActive ? <Check className="size-4 shrink-0" /> : null}
                  </button>
                )
              })}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}
