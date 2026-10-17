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

/** Marker on the timeline rail. Shape and colour both encode status. */
export function StatusNode({ status, pending, className }: { status: PostStatus; pending?: boolean; className?: string }) {
  if (pending) {
    return <Loader2 aria-hidden className={cn('size-3.5 animate-spin text-ink-3', className)} strokeWidth={2.5} />
  }
  return (
    <span
      aria-hidden
      className={cn(
        'block rounded-full ring-4 ring-canvas',
        status === 'scheduled' && 'size-3 border-2 border-scheduled-dot bg-canvas',
        status === 'published' && 'size-3 bg-published-dot',
        status === 'failed' && 'size-3 bg-failed-dot shadow-[0_0_0_3px_var(--failed-bg)]',
        className,
      )}
    />
  )
}

const LABEL_TONE: Record<PostStatus, string> = {
  scheduled: 'text-scheduled-ink',
  published: 'text-published-ink',
  failed: 'text-failed-ink',
}

/** Inline status word for meta lines, where a pill would be too loud. */
export function StatusLabel({ status, pending }: { status: PostStatus; pending?: boolean }) {
  return (
    <span className={cn('font-medium', LABEL_TONE[status])}>
      {pending ? 'Publishing…' : STATUS_LABELS[status]}
    </span>
  )
}
