import { format, isToday } from 'date-fns'
import { useRef, type ReactNode } from 'react'
import { formatLocal, dayLabel } from '@/lib/dates'
import { gsap, prefersReducedMotion, useGSAP, useStaggerIn } from '@/lib/motion'
import { cn, pluralize } from '@/lib/utils'
import type { DayGroup } from '../utils/grouping'
import { RAIL_GRID, TimelineRow } from './TimelineRow'

/** Accent line marking the current moment inside today. */
function NowMarker({ now }: { now: Date }) {
  const label = formatLocal(now.toISOString(), 'h:mm a')
  const ref = useRef<HTMLLIElement>(null)

  // The line draws across once, after the rows have settled.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from('[data-now-line]', { scaleX: 0, transformOrigin: 'left center', duration: 0.8, delay: 0.3, ease: 'power2.inOut' })
      gsap.from('[data-now-label]', { autoAlpha: 0, x: -6, duration: 0.4, delay: 0.9 })
    },
    { scope: ref },
  )

  return (
    <li ref={ref} className={cn(RAIL_GRID, 'h-7 items-center')} aria-label={`Now, ${label}`}>
      <span className="text-right font-mono text-[11px] font-medium tracking-wider text-accent uppercase">Now</span>
      <span className="relative flex h-full items-center justify-center">
        <span aria-hidden className="absolute inset-y-0 w-px bg-line" />
        <span aria-hidden className="relative size-2.5 rounded-full bg-accent ring-4 ring-canvas">
          <span className="absolute inset-0 animate-pulse-ring rounded-full bg-accent" />
        </span>
      </span>
      <span aria-hidden className="flex items-center gap-2 pl-1">
        <span data-now-line className="h-px flex-1 bg-accent/45" />
        <span data-now-label className="font-mono text-[11px] text-accent tabular-nums">{label}</span>
      </span>
    </li>
  )
}

export function DaySection({ group, now }: { group: DayGroup; now: Date }) {
  const label = dayLabel(group.date, now)
  const relative = ['Today', 'Tomorrow', 'Yesterday'].includes(label)
  const headingId = `day-${group.key}`
  const today = isToday(group.date)
  const nowIndex = today ? group.posts.findIndex((p) => new Date(p.scheduledAt) > now) : -1
  const insertAt = today ? (nowIndex === -1 ? group.posts.length : nowIndex) : -1

  return (
    <section aria-labelledby={headingId} className="mt-2">
      <header className="sticky top-[var(--header-h)] z-20 -mx-2 flex items-baseline gap-3 bg-canvas px-2 pt-6 pb-3">
        <h2 id={headingId} className="text-[17px] leading-none font-semibold tracking-[-0.02em]">
          {relative ? label : format(group.date, 'EEEE')}
        </h2>
        <span className="text-[12.5px] font-medium tracking-wide text-ink-3 uppercase">
          {relative ? format(group.date, 'EEE, MMM d') : format(group.date, 'MMM d')}
        </span>
        <span aria-hidden className="h-px flex-1 translate-y-[-4px] bg-line" />
        <span className="text-[12.5px] text-ink-3 tabular-nums">{pluralize(group.posts.length, 'post')}</span>
      </header>
      <ol>
        {group.posts.map((post, i) => (
          <PostWithMarker key={post.id} showMarker={i === insertAt} now={now}>
            <TimelineRow post={post} now={now} />
          </PostWithMarker>
        ))}
        {insertAt === group.posts.length && <NowMarker now={now} />}
      </ol>
    </section>
  )
}

function PostWithMarker({ showMarker, now, children }: { showMarker: boolean; now: Date; children: ReactNode }) {
  return (
    <>
      {showMarker && <NowMarker now={now} />}
      {children}
    </>
  )
}

export function Timeline({
  upcoming,
  past,
  now,
  animateKey,
}: {
  upcoming: DayGroup[]
  past: DayGroup[]
  now: Date
  /** Changes when the visible set changes (filters), replaying the entrance. */
  animateKey: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  useStaggerIn(ref, animateKey)
  return (
    <div ref={ref} className="pb-20">
      {upcoming.map((g) => (
        <DaySection key={g.key} group={g} now={now} />
      ))}
      {past.length > 0 && (
        <>
          <div role="separator" className="mt-12 mb-1 flex items-center gap-3 text-[11px] font-medium tracking-[0.08em] text-ink-3 uppercase">
            Earlier
            <span className="h-px flex-1 bg-line" />
          </div>
          {past.map((g) => (
            <DaySection key={g.key} group={g} now={now} />
          ))}
        </>
      )}
    </div>
  )
}
