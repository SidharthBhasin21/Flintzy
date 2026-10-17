import { CircleAlert, Loader2, RotateCw } from 'lucide-react'
import { PlatformIconList } from '@/components/platform/PlatformIcon'
import { StatusBadge } from '@/components/posts/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatTime, formatUtc, relativeTime } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { usePostActions } from '../actions/context'
import { usePosts } from '../store/context'
import type { Post } from '../types'
import { PostActionsMenu } from './PostActionsMenu'
import { PostThumb } from './PostThumb'

/**
 * One post in a day group. The whole row opens details (via a stretched
 * button), while Retry and the menu sit above it as separate targets.
 */
export function PostRow({ post, now }: { post: Post; now: Date }) {
  const { pending } = usePosts()
  const actions = usePostActions()
  const retrying = pending[post.id] === 'retry'
  const utcTitle = `${formatUtc(post.scheduledAt)} UTC`

  return (
    <li
      className={cn(
        'group relative grid items-center gap-x-4 px-3 py-3 transition-colors duration-150 hover:bg-hover/60 sm:px-4',
        'grid-cols-[48px_minmax(0,1fr)_auto]',
        'md:grid-cols-[48px_minmax(0,1fr)_72px_92px_104px_32px]',
      )}
    >
      <PostThumb post={post} className="size-12" />

      <div className="min-w-0">
        <button
          type="button"
          onClick={() => actions.view(post)}
          className="block w-full text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-lg focus-visible:after:ring-2 focus-visible:after:ring-focus focus-visible:after:ring-inset"
        >
          <span className="sr-only">Open post: </span>
          <span className="line-clamp-2 text-[13.5px] leading-snug text-ink">{post.content}</span>
        </button>

        {post.status === 'failed' && post.errorMessage && (
          <p className="mt-1 flex items-start gap-1 text-[12.5px] leading-snug text-failed-ink">
            <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" strokeWidth={2} />
            <span className="line-clamp-1">{post.errorMessage}</span>
          </p>
        )}

        {/* Compact meta line on small screens */}
        <div className="mt-1.5 flex items-center gap-2.5 text-[12px] text-ink-2 md:hidden">
          <PlatformIconList platforms={post.platforms} iconClassName="size-3.5" />
          <time dateTime={post.scheduledAt} title={utcTitle} className="tabular-nums">
            {formatTime(post.scheduledAt)}
          </time>
          <StatusBadge status={post.status} pending={retrying} className="ml-auto" />
        </div>
      </div>

      <PlatformIconList platforms={post.platforms} className="hidden md:inline-flex" />

      <div className="hidden leading-tight md:block">
        <time dateTime={post.scheduledAt} title={utcTitle} className="block text-[13px] text-ink tabular-nums">
          {formatTime(post.scheduledAt)}
        </time>
        <span className="text-[12px] text-ink-3">{relativeTime(post.scheduledAt, now)}</span>
      </div>

      <div className="relative z-10 hidden items-center gap-1.5 md:flex">
        {post.status === 'failed' && !retrying ? (
          <Button size="sm" onClick={() => actions.retry(post)} aria-label="Retry publishing this post">
            <RotateCw strokeWidth={1.75} />
            Retry
          </Button>
        ) : (
          <StatusBadge status={post.status} pending={retrying} />
        )}
      </div>

      <div className="relative z-10 flex items-start self-start md:self-center">
        {post.status === 'failed' && !retrying && (
          <Button
            size="icon-sm"
            variant="ghost"
            onClick={() => actions.retry(post)}
            aria-label="Retry publishing this post"
            className="md:hidden"
          >
            <RotateCw strokeWidth={1.75} />
          </Button>
        )}
        {retrying && <Loader2 aria-hidden className="m-1.5 size-4 animate-spin text-ink-3 md:hidden" />}
        <PostActionsMenu post={post} busy={retrying} className="max-md:-mr-1" />
      </div>
    </li>
  )
}
