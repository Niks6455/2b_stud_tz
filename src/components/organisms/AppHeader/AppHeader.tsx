import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  Columns3,
  LayoutDashboard,
  LogOut,
  Search,
} from 'lucide-react'
import { Button } from '@/components/atoms'
import { useAuth } from '@/features/auth/AuthProvider'
import { saveReturnTo } from '@/features/auth/returnTo'
import { ROLE_LABELS } from '@/lib/status-machine'
import { SHELL_MAX, SHELL_PAD } from '@/shared/lib/shell'
import { cn } from '@/shared/lib/cn'
import type { AppHeaderProps } from './types'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'inline-flex items-center gap-1.5 border-b-2 px-1 py-2 text-sm font-medium transition-colors',
    isActive
      ? 'border-primary text-ink'
      : 'border-transparent text-ink-muted hover:text-ink',
  )

export function AppHeader({ onOpenCommand }: AppHeaderProps) {
  const { profile, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/80 shadow-sm backdrop-blur-md">
      <div
        className={cn(
          'mx-auto flex w-full items-center gap-4 py-0',
          SHELL_MAX,
          SHELL_PAD,
        )}
      >
        <NavLink
          to="/dashboard"
          className="flex shrink-0 items-center gap-2 py-3"
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-white">
            <Building2 className="size-3.5" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            СтройCRM
          </span>
        </NavLink>

        <nav className="hidden items-center gap-4 lg:flex">
          <NavLink to="/dashboard" className={linkClass}>
            <LayoutDashboard className="size-3.5" />
            Дашборд
          </NavLink>
          <NavLink to="/board" className={linkClass}>
            <Columns3 className="size-3.5" />
            Канбан
          </NavLink>
          <NavLink to="/objects" className={linkClass}>
            <Building2 className="size-3.5" />
            Объекты
          </NavLink>
          <NavLink to="/my-tasks" className={linkClass}>
            <ClipboardList className="size-3.5" />
            Задачи
          </NavLink>
        </nav>

        <button
          type="button"
          onClick={onOpenCommand}
          className="ml-auto hidden min-w-0 max-w-xs flex-1 items-center gap-2 border border-line bg-paper px-3 py-1.5 text-left text-sm text-ink-faint transition-colors hover:border-ink/25 hover:text-ink-muted sm:flex"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1 truncate">Поиск</span>
          <kbd className="shrink-0 border border-line bg-paper-elevated px-1.5 py-0.5 text-[10px] font-medium text-ink-faint">
            ⌘K
          </kbd>
        </button>

        <div className="flex shrink-0 items-center gap-2 sm:ml-0 ml-auto">
          <Button
            variant="secondary"
            size="sm"
            onClick={onOpenCommand}
            className="sm:hidden"
            aria-label="Поиск"
          >
            <Search className="size-4" />
          </Button>
          {profile ? (
            <div className="hidden border-l border-line pl-3 text-right md:block">
              <p className="text-sm leading-tight font-medium text-ink">
                {profile.full_name}
              </p>
              <p className="text-xs text-ink-muted">
                {ROLE_LABELS[profile.role]}
              </p>
            </div>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const returnTo = `${location.pathname}${location.search}`
              saveReturnTo(returnTo)
              void signOut().then(() => {
                navigate('/login', {
                  replace: true,
                  state: { from: { pathname: returnTo } },
                })
              })
            }}
            aria-label="Выйти"
          >
            <LogOut className="size-4" />
            <span className="hidden md:inline">Выйти</span>
          </Button>
        </div>
      </div>

      <nav
        className={cn(
          'mx-auto flex w-full gap-4 overflow-x-auto border-t border-line lg:hidden',
          SHELL_MAX,
          SHELL_PAD,
        )}
      >
        <NavLink to="/dashboard" className={linkClass}>
          Дашборд
        </NavLink>
        <NavLink to="/board" className={linkClass}>
          Канбан
        </NavLink>
        <NavLink to="/objects" className={linkClass}>
          <Building2 className="size-3.5" />
          Объекты
        </NavLink>
        <NavLink to="/my-tasks" className={linkClass}>
          Задачи
        </NavLink>
      </nav>
    </header>
  )
}
