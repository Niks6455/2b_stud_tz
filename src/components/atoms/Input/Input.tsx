import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { InputProps } from './types'

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-line bg-paper-elevated px-3 text-sm text-ink',
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

Input.displayName = 'Input'
