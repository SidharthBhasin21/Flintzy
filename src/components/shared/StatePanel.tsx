import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Shared layout for empty, no-results and error states. */
export function StatePanel({
  icon: Icon,
  title,
  description,
  action,
  tone = 'neutral',
  className,
}: {
  icon: LucideIcon
  title: string
  description: ReactNode
  action?: ReactNode
  tone?: 'neutral' | 'danger'
  className?: string
}) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : undefined}
      className={cn('flex flex-col items-center px-6 py-16 text-center', className)}
    >
      <span
        className={cn(
          'mb-4 inline-flex size-10 items-center justify-center rounded-lg border',
          tone === 'danger'
            ? 'border-failed-dot/20 bg-failed-bg text-failed-ink'
            : 'border-line bg-surface text-ink-2',
        )}
      >
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>
      <h2 className="text-[15px] font-semibold tracking-tight">{title}</h2>
      <p className="mt-1 max-w-[340px] text-[13px] leading-relaxed text-ink-2">{description}</p>
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  )
}
