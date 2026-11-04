import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AppFooter, AppHeader } from '@/components/organisms'
import { CommandPalette } from '@/components/organisms/CommandPalette'
import { useRealtimeInvalidation } from '@/features/realtime/useRealtimeInvalidation'
import { SHELL_MAX, SHELL_PAD } from '@/shared/lib/shell'
import { cn } from '@/shared/lib/cn'

export function AppLayout() {
  const [cmdOpen, setCmdOpen] = useState(false)
  const location = useLocation()
  useRealtimeInvalidation()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCmdOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const isHome = location.pathname === '/dashboard' || location.pathname === '/'

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader onOpenCommand={() => setCmdOpen(true)} />
      <main
        className={cn(
          'mx-auto w-full flex-1 py-8 md:py-10',
          SHELL_MAX,
          SHELL_PAD,
        )}
      >
        <Outlet />
      </main>
      {isHome ? <AppFooter /> : null}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  )
}
