import type { ReactNode } from 'react'

export interface FilterMenuOption<T extends string> {
  value: T
  label: string
  hint?: string
  leading?: ReactNode
}

export interface FilterMenuProps<T extends string> {
  value: T
  options: FilterMenuOption<T>[]
  onChange: (value: T) => void
  icon?: ReactNode
  placeholder?: string
  className?: string
}
