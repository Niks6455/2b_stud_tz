import { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'
import type { ButtonProps, ButtonSize, ButtonVariant } from './types'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-primary-fg shadow-sm shadow-primary/20 hover:bg-primary-hover active:bg-primary-active',
  secondary:
    'bg-white text-ink border border-line hover:bg-primary-soft hover:border-primary/25',
  ghost: 'bg-transparent text-ink-muted hover:bg-primary-soft hover:text-ink',
  danger:
    'bg-danger text-danger-fg hover:bg-danger-hover active:bg-danger-hover/90',
  success:
    'bg-success text-success-fg hover:bg-success-hover active:bg-success-hover/90',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm rounded-lg',
  md: 'h-10 px-3.5 text-sm rounded-lg',
  lg: 'h-11 px-4 text-[15px] rounded-xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium',
        'transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
        'disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
      ) : null}
      {children}
    </button>
  ),
)

Button.displayName = 'Button'
