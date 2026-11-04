import { Link } from 'react-router-dom'
import { ClipboardList, MapPin } from 'lucide-react'
import type { ObjectCardProps } from './types'

function tasksLabel(count: number) {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return `${count} задача`
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `${count} задачи`
  }
  return `${count} задач`
}

export function ObjectCard({ object }: ObjectCardProps) {
  const count = object.tasks_count ?? 0

  return (
    <Link
      to={`/objects/${object.id}`}
      className="group block rounded-xl border border-line bg-paper-elevated p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl font-semibold tracking-tight text-ink group-hover:text-primary">
          {object.name}
        </h3>
        <span className="inline-flex shrink-0 items-center gap-1.5 border border-line px-2 py-1 text-xs font-medium text-ink-muted">
          <ClipboardList className="size-3.5" />
          {tasksLabel(count)}
        </span>
      </div>
      <p className="mt-2 flex items-start gap-1.5 text-sm text-ink-muted">
        <MapPin className="mt-0.5 size-3.5 shrink-0 text-ink-faint" />
        {object.address}
      </p>
    </Link>
  )
}
