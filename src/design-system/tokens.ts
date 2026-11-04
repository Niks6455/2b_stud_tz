export const color = {
  white: '#ffffff',
  black: '#0f172a',
  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    800: '#1e293b',
    900: '#0f172a',
  },
  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  cyan: {
    100: '#cffafe',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
  },
  success: {
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    100: '#ffedd5',
    500: '#f97316',
    600: '#ea580c',
  },
  danger: {
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
  },
} as const

export const semantic = {
  bg: 'var(--ds-bg)',
  bgElevated: 'var(--ds-bg-elevated)',
  fg: 'var(--ds-fg)',
  fgMuted: 'var(--ds-fg-muted)',
  primary: 'var(--ds-primary)',
  primaryHover: 'var(--ds-primary-hover)',
  cyan: 'var(--ds-cyan)',
  danger: 'var(--ds-danger)',
  dangerHover: 'var(--ds-danger-hover)',
  success: 'var(--ds-success)',
  successHover: 'var(--ds-success-hover)',
} as const

export const radius = {
  sm: 'var(--ds-radius-sm)',
  md: 'var(--ds-radius-md)',
  lg: 'var(--ds-radius-lg)',
  xl: 'var(--ds-radius-xl)',
  '2xl': 'var(--ds-radius-2xl)',
} as const
