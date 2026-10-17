import { Loader2 } from 'lucide-react'
import { STATUS_LABELS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { PostStatus } from '@/features/posts/types'

const STYLES: Record<PostStatus, { badge: string; dot: string }> = {
  scheduled: { badge: 'bg-scheduled-bg text-scheduled-ink', dot: 'bg-scheduled-dot' },
  published: { badge: 'bg-published-bg text-published-ink', dot: 'bg-published-dot' },
  failed: { badge: 'bg-failed-bg text-failed-ink', dot: 'bg-failed-dot' },
}

export function StatusDot({ status, className }: { status: PostStatus; className?: string }) {
  return <span aria-hidden className={cn('size-1.5 shrink-0 rounded-full', STYLES[status].dot, className)} />
}

export function StatusBadge({
  status,
  pending,
  className,
}: {
  status: PostStatus
  /** Shown while an optimistic change waits for the server. */
  pending?: boolean
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex h-[22px] items-center gap-1.5 rounded-full px-2 text-[12px] font-medium whitespace-nowrap transition-colors duration-300',
        STYLES[status].badge,
        className,
      )}
    >
      {pending ? (
        <Loader2 aria-hidden className="size-3 animate-spin" strokeWidth={2.25} />
      ) : (
        <StatusDot status={status} />
      )}
      {STATUS_LABELS[status]}
      {pending && <span className="sr-only">, confirming</span>}
    </span>
  )
}
