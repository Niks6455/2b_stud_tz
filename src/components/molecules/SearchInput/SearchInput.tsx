import { Search } from 'lucide-react'
import { Input } from '@/components/atoms'
import type { SearchInputProps } from './types'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Поиск…',
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-ink-faint" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-10 pl-9 font-medium"
      />
    </div>
  )
}
