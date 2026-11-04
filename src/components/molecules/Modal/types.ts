import type { ReactNode } from 'react'

export type ModalSize = 'md' | 'lg'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  size?: ModalSize
  footer?: ReactNode
}
