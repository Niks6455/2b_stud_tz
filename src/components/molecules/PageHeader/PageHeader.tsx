import type { PageHeaderProps } from './types'

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <h1 className="font-display text-[1.85rem] leading-tight font-bold text-ink md:text-[2.15rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-ink-muted">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  )
}
