import { Link } from 'react-router-dom'
import { SHELL_MAX, SHELL_PAD } from '@/shared/lib/shell'
import { cn } from '@/shared/lib/cn'
import type { AppFooterProps } from './types'

const COPYRIGHT_YEAR = new Date().getFullYear()

export function AppFooter({ className }: AppFooterProps) {
  return (
    <footer className={cn('mt-auto border-t border-line bg-paper-elevated', className)}>
      <div
        className={cn(
          'mx-auto flex w-full flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between',
          SHELL_MAX,
          SHELL_PAD,
        )}
      >
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-ink">СтройCRM</span>
          <span className="mx-2 text-line">·</span>
          Объекты и задачи · © {COPYRIGHT_YEAR}
        </p>

        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-muted">
          <Link to="/dashboard" className="hover:text-ink">
            Дашборд
          </Link>
          <Link to="/board" className="hover:text-ink">
            Канбан
          </Link>
          <Link to="/objects" className="hover:text-ink">
            Объекты
          </Link>
          <Link to="/my-tasks" className="hover:text-ink">
            Задачи
          </Link>
        </nav>
      </div>
    </footer>
  )
}
