import { ArrowLeft, CircleAlert, PenLine, RotateCw, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { PlatformIcon } from '@/components/platform/PlatformIcon'
import { StatusBadge } from '@/components/posts/StatusBadge'
import { MediaThumb } from '@/components/shared/MediaThumb'
import { Button } from '@/components/ui/button'
import { DialogClose, DialogDescription, DialogTitle, SheetCloseButton } from '@/components/ui/dialog'
import { PLATFORMS } from '@/lib/constants'
import { formatLocal, formatUtc, localTimeZone, relativeTime, zoneAbbreviation } from '@/lib/dates'
import { cn, countCharacters, formatNumber } from '@/lib/utils'
import { usePostActions } from '../actions/context'
import { useNow } from '../hooks/useNow'
import { usePosts } from '../store/context'
import { PostActionsMenu } from './PostActionsMenu'

/** Loaded on demand the first time a post is opened. */
export default function Details({ postId, busy }: { postId: string; busy: boolean }) {
  const { posts } = usePosts()
  const actions = usePostActions()
  const now = useNow()
  const post = posts.find((p) => p.id === postId)
  if (!post) return null

  const when = new Date(post.scheduledAt)
  const characters = countCharacters(post.content)
  const timeLabel = post.status === 'scheduled' ? 'Scheduled for' : post.status === 'published' ? 'Published' : 'Was due'

  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line pr-3 pl-2 sm:pl-5">
        <DialogClose asChild>
          <Button variant="ghost" size="icon" aria-label="Back to queue" className="sm:hidden">
            <ArrowLeft strokeWidth={1.75} />
          </Button>
        </DialogClose>
        <DialogTitle className="flex-1 text-[16px] font-semibold tracking-[-0.01em] max-sm:text-center">
          Post details
        </DialogTitle>
        <DialogDescription className="sr-only">
          Content, platforms, schedule and status for this post.
        </DialogDescription>
        <PostActionsMenu post={post} busy={busy} hideView />
        <SheetCloseButton className="max-sm:hidden" />
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="px-5 pt-5">
          {post.mediaUrl && (
            <MediaThumb src={post.mediaUrl} className="mb-5 aspect-[16/10] w-full rounded-lg" />
          )}
          <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap break-words text-ink">{post.content}</p>
        </div>

        {post.status === 'failed' && post.errorMessage && (
          <div role="alert" className="mx-5 mt-5 flex gap-2.5 rounded-lg border border-failed-dot/20 bg-failed-bg/60 p-3 text-[13px] text-failed-ink">
            <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0" strokeWidth={2} />
            <div>
              <p className="font-medium">Publishing failed</p>
              <p className="mt-0.5 leading-snug">{post.errorMessage}</p>
            </div>
          </div>
        )}

        <dl className="mx-5 mt-5 mb-6 divide-y divide-line border-t border-line text-[13px]">
          <Row label="Status">
            <StatusBadge status={post.status} pending={busy} />
          </Row>
          <Row label={timeLabel}>
            <p className="text-ink tabular-nums">
              {formatLocal(post.scheduledAt, "EEE, MMM d, yyyy 'at' h:mm a")}{' '}
              <span className="text-ink-3">{zoneAbbreviation(when)}</span>
            </p>
            <p className="mt-0.5 text-[12.5px] text-ink-3 tabular-nums">
              {formatUtc(post.scheduledAt)} UTC · {relativeTime(post.scheduledAt, now)}
            </p>
            <p className="sr-only">Local time zone: {localTimeZone()}</p>
          </Row>
          <Row label="Platforms">
            <ul className="space-y-2">
              {post.platforms.map((p) => {
                const limit = PLATFORMS[p].charLimit
                const over = characters > limit
                return (
                  <li key={p} className="flex items-center gap-2.5">
                    <PlatformIcon decorative platform={p} />
                    <span className="text-ink">{PLATFORMS[p].label}</span>
                    <span className="truncate text-ink-3">{PLATFORMS[p].handle}</span>
                    <span
                      className={cn('ml-auto font-mono text-[11.5px] tabular-nums', over ? 'text-failed-ink' : 'text-ink-3')}
                      title="Characters used of the platform limit"
                    >
                      {formatNumber(characters)}/{formatNumber(limit)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </Row>
        </dl>
      </div>

      {post.status !== 'published' && (
        <footer className="flex shrink-0 gap-2 border-t border-line px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button variant="danger-ghost" size="lg" onClick={() => actions.requestDelete(post)} disabled={busy}>
            <Trash2 strokeWidth={1.75} />
            Delete
          </Button>
          <div className="ml-auto flex gap-2 max-sm:flex-1 max-sm:[&>*]:flex-1">
            <Button size="lg" onClick={() => actions.edit(post)} disabled={busy}>
              <PenLine strokeWidth={1.75} />
              {post.status === 'failed' ? 'Edit' : 'Edit post'}
            </Button>
            {post.status === 'failed' && (
              <Button variant="primary" size="lg" onClick={() => actions.retry(post)} disabled={busy}>
                <RotateCw strokeWidth={1.75} />
                Retry now
              </Button>
            )}
          </div>
        </footer>
      )}
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[104px_minmax(0,1fr)] gap-3 py-3.5">
      <dt className="pt-0.5 text-ink-3">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </div>
  )
}
