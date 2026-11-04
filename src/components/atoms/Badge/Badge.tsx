import { cn } from '@/shared/lib/cn'
import type { BadgeProps, BadgeTone } from './types'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
  amber: 'bg-blue-50 text-blue-700 border-blue-200',
  steel: 'bg-sky-100 text-sky-700 border-sky-200',
  success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  warning: 'bg-orange-100 text-orange-700 border-orange-200',
  danger: 'bg-rose-100 text-rose-700 border-rose-200',
  info: 'bg-indigo-100 text-indigo-700 border-indigo-200',
}

export function Badge({ className, tone = 'neutral', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
