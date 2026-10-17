import { format } from 'date-fns'
import { dayLabel } from '@/lib/dates'
import { pluralize } from '@/lib/utils'
import type { DayGroup } from '../utils/grouping'
import { PostRow } from './PostRow'

export function DaySection({ group, now }: { group: DayGroup; now: Date }) {
  const label = dayLabel(group.date, now)
  const showDate = ['Today', 'Tomorrow', 'Yesterday'].includes(label)
  const headingId = `day-${group.key}`
  return (
    <section aria-labelledby={headingId}>
      <header className="sticky top-0 z-20 -mx-1 flex items-baseline gap-2 bg-canvas/92 px-1 pt-5 pb-2.5 backdrop-blur-sm">
        <h2 id={headingId} className="text-[15px] font-semibold tracking-tight">
          {label}
        </h2>
        {showDate && <span className="text-[13px] text-ink-3">{format(group.date, 'EEE, MMM d')}</span>}
        <span className="ml-auto text-[12.5px] text-ink-3 tabular-nums">{pluralize(group.posts.length, 'post')}</span>
      </header>
      <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {group.posts.map((post) => (
          <PostRow key={post.id} post={post} now={now} />
        ))}
      </ul>
    </section>
  )
}

export function DayGroupList({ upcoming, past, now }: { upcoming: DayGroup[]; past: DayGroup[]; now: Date }) {
  return (
    <div className="pb-16">
      {upcoming.map((g) => (
        <DaySection key={g.key} group={g} now={now} />
      ))}
      {past.length > 0 && (
        <>
          <div className="mt-10 mb-1 flex items-center gap-3 text-[12px] font-medium tracking-wide text-ink-3 uppercase" role="separator">
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
