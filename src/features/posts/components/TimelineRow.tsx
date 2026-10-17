import { CircleAlert, PenLine, RotateCw } from 'lucide-react'
import { useRef } from 'react'
import { PlatformIconList } from '@/components/platform/PlatformIcon'
import { StatusLabel, StatusNode } from '@/components/posts/StatusBadge'
import { MediaThumb } from '@/components/shared/MediaThumb'
import { Button } from '@/components/ui/button'
import { formatLocal, formatUtc, relativeTime } from '@/lib/dates'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { usePostActions } from '../actions/context'
import { usePosts } from '../store/context'
import type { Post } from '../types'
import { PostActionsMenu } from './PostActionsMenu'

/** Column template shared by rows and the "now" marker so the rail lines up. */
export const RAIL_GRID = 'grid grid-cols-[52px_28px_minmax(0,1fr)] sm:grid-cols-[64px_32px_minmax(0,1fr)]'

/**
 * One post on the timeline. The card opens details (stretched button); Retry,
 * Edit and the menu sit above it as separate targets.
 */
export function TimelineRow({ post, now }: { post: Post; now: Date }) {
  const { pending } = usePosts()
  const actions = usePostActions()
  const retrying = pending[post.id] === 'retry'
  const failed = post.status === 'failed' && !retrying
  const ref = useRef<HTMLLIElement>(null)
  const lastStatus = useRef(post.status)

  // When the status changes in place (retry succeeds or rolls back), pop the
  // marker and wash the card in the new status colour so the change is noticed.
  useGSAP(
    () => {
      if (lastStatus.current === post.status) return
      lastStatus.current = post.status
      if (prefersReducedMotion()) return
      gsap.fromTo('[data-node]', { scale: 0.2 }, { scale: 1, duration: 0.55, ease: 'back.out(3)' })
      gsap.fromTo('[data-flash]', { autoAlpha: 1 }, { autoAlpha: 0, duration: 1.2, ease: 'power2.out' })
    },
    { scope: ref, dependencies: [post.status] },
  )

  return (
    <li ref={ref} data-enter className={cn(RAIL_GRID, 'group')}>
      <time
        dateTime={post.scheduledAt}
        title={`${formatUtc(post.scheduledAt)} UTC`}
        className="pt-[15px] text-right leading-none"
      >
        <span className="block font-mono text-[13px] text-ink tabular-nums">{formatLocal(post.scheduledAt, 'h:mm')}</span>
        <span className="mt-1 block text-[10.5px] font-medium tracking-wide text-ink-3">
          {formatLocal(post.scheduledAt, 'a')}
        </span>
      </time>

      <div className="relative flex justify-center">
        <span aria-hidden className="absolute inset-y-0 w-px bg-line" />
        <span data-node className="relative mt-[17px]">
          <StatusNode status={post.status} pending={retrying} />
        </span>
      </div>

      <div className="pb-2">
        <article
          className={cn(
            'relative flex gap-4 rounded-xl px-3.5 py-3 transition-[background-color,box-shadow] duration-150',
            'hover:bg-surface hover:shadow-[0_0_0_1px_var(--line),0_1px_2px_rgb(0_0_0/0.03)]',
            'has-[[data-row-open]:focus-visible]:bg-surface has-[[data-row-open]:focus-visible]:shadow-[0_0_0_2px_var(--focus)]',
            failed && 'bg-failed-bg/40 hover:bg-failed-bg/55',
          )}
        >
          <span
            data-flash
            aria-hidden
            className={cn(
              'pointer-events-none invisible absolute inset-0 rounded-xl',
              post.status === 'failed' ? 'bg-failed-bg' : post.status === 'published' ? 'bg-published-bg' : 'bg-scheduled-bg',
            )}
          />
          <div className="relative min-w-0 flex-1">
            <button
              type="button"
              data-row-open
              onClick={() => actions.view(post)}
              className="block w-full text-left outline-none after:absolute after:inset-0 after:rounded-xl after:content-['']"
            >
              <span className="sr-only">Open post: </span>
              <span className="line-clamp-2 text-[14px] leading-snug text-ink">{post.content}</span>
            </button>

            {post.status === 'failed' && post.errorMessage && (
              <p className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-snug text-failed-ink">
                <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" strokeWidth={2} />
                <span className="line-clamp-2">{post.errorMessage}</span>
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12.5px] text-ink-3">
              <PlatformIconList platforms={post.platforms} iconClassName="size-3.5" />
              <span aria-hidden>·</span>
              <StatusLabel status={post.status} pending={retrying} />
              <span aria-hidden>·</span>
              <span>{relativeTime(post.scheduledAt, now)}</span>
            </div>

            {failed && (
              <div className="relative z-10 mt-3 flex gap-2">
                <Button size="sm" variant="primary" onClick={() => actions.retry(post)}>
                  <RotateCw strokeWidth={2} />
                  Retry now
                </Button>
                <Button size="sm" onClick={() => actions.edit(post)}>
                  <PenLine strokeWidth={1.75} />
                  Reschedule
                </Button>
              </div>
            )}
          </div>

          {post.mediaUrl && <MediaThumb src={post.mediaUrl} className="relative size-16 rounded-lg max-sm:size-14" />}

          <div className="relative z-10 -mt-1 -mr-1.5 self-start">
            <PostActionsMenu
              post={post}
              busy={retrying}
              className="text-ink-3 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 md:data-[state=open]:opacity-100"
            />
          </div>
        </article>
      </div>
    </li>
  )
}
