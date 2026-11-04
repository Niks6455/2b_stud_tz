import type { HTMLAttributes } from 'react'

export type BadgeTone =
  | 'neutral'
  | 'amber'
  | 'steel'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone
}
