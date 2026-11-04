import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { TextareaProps } from './types'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'flex min-h-28 w-full rounded-lg border border-line bg-paper-elevated px-3 py-2.5 text-sm text-ink',
        'placeholder:text-ink-faint',
        'transition-colors duration-150',
        'hover:border-ink/25',
        'focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
)

Textarea.displayName = 'Textarea'
