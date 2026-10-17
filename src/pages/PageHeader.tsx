import type { ReactNode } from 'react'

export function PageHeader({ title, summary, actions }: { title: string; summary?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-[28px] leading-none font-bold tracking-[-0.035em] sm:text-[30px]">{title}</h1>
        {summary && <p className="mt-2 text-[13.5px] text-ink-2">{summary}</p>}
      </div>
      {actions}
    </div>
  )
}
