import type { ReactNode } from 'react'

export function PageHeader({ title, summary, actions }: { title: string; summary?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {/* On small screens the active tab already names the page. */}
        <h1 className="text-[22px] font-semibold tracking-[-0.02em] max-lg:sr-only">{title}</h1>
        {summary && <p className="mt-0.5 text-[13px] text-ink-2 max-lg:mt-0">{summary}</p>}
      </div>
      {actions}
    </div>
  )
}
