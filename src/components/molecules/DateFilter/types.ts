export type DatePreset = 'all' | 'today' | 'week' | 'month' | 'custom'

export interface DateFilterValue {
  preset: DatePreset
  from?: string
  to?: string
}

export interface DateFilterProps {
  value: DateFilterValue
  onChange: (value: DateFilterValue) => void
  className?: string
}
