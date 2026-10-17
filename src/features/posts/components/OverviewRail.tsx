import { addDays, format, isSameDay, startOfDay } from 'date-fns'
import { useRef, type ReactNode } from 'react'
import { ArrowUpRight, RotateCw } from 'lucide-react'
import { useNavigate } from 'react-router'
import { PlatformIcon, PlatformIconList } from '@/components/platform/PlatformIcon'
import { MediaThumb } from '@/components/shared/MediaThumb'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PLATFORMS, PLATFORM_ORDER } from '@/lib/constants'
import { dayKey, formatLocal, relativeTime } from '@/lib/dates'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { cn, pluralize } from '@/lib/utils'
import { usePostActions } from '../actions/context'
import { usePostFilters } from '../hooks/usePostFilters'
import { usePosts } from '../store/context'
import type { Post } from '../types'

function RailSection({ title, aside, children }: { title: string; aside?: ReactNode; children: ReactNode }) {
  return (
    <section className="border-t border-line pt-4 pb-7 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-[11px] font-medium tracking-[0.08em] text-ink-3 uppercase">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** At-a-glance context for the queue. Every number here is derived from posts. */
export function OverviewRail({ now, className }: { now: Date; className?: string }) {
  const { posts, status } = usePosts()

  if (status !== 'ready') {
    return (
      <aside aria-label="Overview" className={className}>
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="mt-8 h-24 w-full rounded-xl" />
      </aside>
    )
  }

  const upcoming = posts
    .filter((p) => p.status === 'scheduled' && new Date(p.scheduledAt) > now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const failed = posts
    .filter((p) => p.status === 'failed')
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))

  return (
    <aside aria-label="Overview" className={className}>
      <NextUp post={upcoming[0]} now={now} />
      <WeekLoad upcoming={upcoming} now={now} />
      {failed.length > 0 && <NeedsAttention failed={failed} />}
      <Accounts upcoming={upcoming} />
    </aside>
  )
}

function NextUp({ post, now }: { post?: Post; now: Date }) {
  const actions = usePostActions()
  return (
    <RailSection title="Next up">
      {post ? (
        <button
          type="button"
          onClick={() => actions.view(post)}
          className="group block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <p className="text-[26px] leading-none font-semibold tracking-[-0.03em] text-ink tabular-nums">
            {relativeTime(post.scheduledAt, now)}
          </p>
          <p className="mt-1.5 text-[12.5px] text-ink-3">
            {formatLocal(post.scheduledAt, "EEE, MMM d 'at' h:mm a")}
          </p>
          <div className="mt-3.5 flex gap-3">
            <p className="line-clamp-3 flex-1 text-[13px] leading-snug text-ink-2 group-hover:text-ink">{post.content}</p>
            {post.mediaUrl && <MediaThumb src={post.mediaUrl} className="size-14 rounded-lg" />}
          </div>
          <PlatformIconList platforms={post.platforms} className="mt-3" iconClassName="size-3.5" />
        </button>
      ) : (
        <div>
          <p className="text-[18px] leading-tight font-semibold tracking-[-0.02em] text-ink">Nothing queued</p>
          <Button variant="secondary" size="sm" className="mt-3" onClick={actions.create}>
            Schedule a post
          </Button>
        </div>
      )}
    </RailSection>
  )
}

/** Scheduled posts per day for the coming week; each bar opens that day in the calendar. */
function WeekLoad({ upcoming, now }: { upcoming: Post[]; now: Date }) {
  const navigate = useNavigate()
  const days = Array.from({ length: 7 }, (_, i) => startOfDay(addDays(now, i)))
  const counts = days.map((d) => upcoming.filter((p) => isSameDay(new Date(p.scheduledAt), d)).length)
  const max = Math.max(...counts, 1)
  const total = counts.reduce((a, b) => a + b, 0)
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-bar]', { scaleY: 0, transformOrigin: 'bottom', duration: 0.7, stagger: 0.05, delay: 0.15 })
    },
    { scope: ref },
  )

  return (
    <RailSection title="Next 7 days" aside={<span className="text-[12px] text-ink-3 tabular-nums">{pluralize(total, 'post')}</span>}>
      <div ref={ref} className="grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <button
            key={d.toISOString()}
            type="button"
            onClick={() => navigate(`/calendar?month=${format(d, 'yyyy-MM')}&day=${dayKey(d)}`)}
            aria-label={`${format(d, 'EEEE, MMM d')}: ${pluralize(counts[i], 'scheduled post')}. Open in calendar`}
            className="group flex flex-col items-center gap-1.5 rounded-md py-1 outline-none hover:bg-hover focus-visible:ring-2 focus-visible:ring-focus"
          >
            <span className="flex h-16 w-full items-end justify-center">
              <span
                data-bar
                className={cn(
                  'w-3 rounded-sm transition-colors',
                  counts[i] === 0 ? 'h-[3px] bg-line-strong' : i === 0 ? 'bg-accent' : 'bg-ink-2 group-hover:bg-ink',
                )}
                style={counts[i] ? { height: `${Math.max((counts[i] / max) * 100, 14)}%` } : undefined}
              />
            </span>
            <span className={cn('text-[11px] font-medium', i === 0 ? 'text-accent' : 'text-ink-3')}>
              {format(d, 'EEEEE')}
            </span>
          </button>
        ))}
      </div>
    </RailSection>
  )
}

function NeedsAttention({ failed }: { failed: Post[] }) {
  const actions = usePostActions()
  const { pending } = usePosts()
  const { setFilters } = usePostFilters()
  return (
    <RailSection
      title="Needs attention"
      aside={
        <button
          type="button"
          onClick={() => setFilters({ statuses: ['failed'] })}
          className="inline-flex items-center gap-0.5 text-[12px] font-medium text-ink-2 hover:text-ink"
        >
          Show all <ArrowUpRight className="size-3" strokeWidth={2} />
        </button>
      }
    >
      <ul className="space-y-3">
        {failed.slice(0, 3).map((post) => (
          <li key={post.id} className="flex items-start gap-2.5">
            <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-failed-dot" />
            <button type="button" onClick={() => actions.view(post)} className="min-w-0 flex-1 text-left">
              <span className="line-clamp-1 text-[13px] text-ink">{post.content}</span>
              <span className="line-clamp-1 text-[12px] text-failed-ink">{post.errorMessage}</span>
            </button>
            <Button
              size="icon-sm"
              variant="ghost"
              aria-label="Retry publishing"
              disabled={Boolean(pending[post.id])}
              onClick={() => actions.retry(post)}
            >
              <RotateCw strokeWidth={1.75} />
            </Button>
          </li>
        ))}
      </ul>
    </RailSection>
  )
}

/** Connected accounts double as quick platform filters. */
function Accounts({ upcoming }: { upcoming: Post[] }) {
  const { filters, setFilters } = usePostFilters()
  return (
    <RailSection title="Accounts">
      <ul className="-mx-2 space-y-0.5">
        {PLATFORM_ORDER.map((p) => {
          const on = filters.platforms.includes(p)
          const count = upcoming.filter((post) => post.platforms.includes(p)).length
          return (
            <li key={p}>
              <button
                type="button"
                aria-pressed={on}
                title={on ? `Stop filtering by ${PLATFORMS[p].label}` : `Show only ${PLATFORMS[p].label} posts`}
                onClick={() =>
                  setFilters({ platforms: on ? filters.platforms.filter((x) => x !== p) : [...filters.platforms, p] })
                }
                className={cn(
                  'flex h-10 w-full items-center gap-3 rounded-lg px-2 text-left transition-colors',
                  on ? 'bg-selected' : 'hover:bg-hover',
                )}
              >
                <PlatformIcon decorative platform={p} />
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-[13px] text-ink">{PLATFORMS[p].label}</span>
                  <span className="block truncate text-[11.5px] text-ink-3">{PLATFORMS[p].handle}</span>
                </span>
                <span className="text-[12px] text-ink-3 tabular-nums" title="Scheduled posts">
                  {count}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </RailSection>
  )
}
