import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { StatusDot } from '@/components/posts/StatusBadge'
import { dayKey, formatTime } from '@/lib/dates'
import { cn, pluralize } from '@/lib/utils'
import { STATUS_ORDER } from '@/lib/constants'
import type { Post } from '@/features/posts/types'

const MAX_ITEMS = 2

export function MonthGrid({
  month,
  selectedKey,
  postsByDay,
  onSelect,
}: {
  month: Date
  selectedKey: string
  postsByDay: Map<string, Post[]>
  onSelect: (key: string) => void
}) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month)),
    end: endOfWeek(endOfMonth(month)),
  })
  const weekdays = days.slice(0, 7)

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      <div className="grid grid-cols-7 border-b border-line" aria-hidden>
        {weekdays.map((d) => (
          <div key={d.toISOString()} className="py-2 text-center text-[11.5px] font-medium text-ink-3">
            <span className="sm:hidden">{format(d, 'EEEEE')}</span>
            <span className="max-sm:hidden">{format(d, 'EEE')}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 [&>*:nth-child(7n)]:border-r-0">
        {days.map((day) => {
          const key = dayKey(day)
          const posts = postsByDay.get(key) ?? []
          const inMonth = isSameMonth(day, month)
          const selected = key === selectedKey
          const today = isToday(day)
          const statuses = STATUS_ORDER.filter((s) => posts.some((p) => p.status === s))
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              aria-pressed={selected}
              aria-label={`${format(day, 'EEEE, MMMM d')}${today ? ', today' : ''}, ${pluralize(posts.length, 'post')}`}
              className={cn(
                'group relative flex min-h-[52px] flex-col items-center gap-1 border-r border-b border-line px-1 pt-1.5 pb-2 text-left transition-colors',
                'sm:min-h-[104px] sm:items-stretch sm:px-1.5',
                selected ? 'bg-selected/60' : 'hover:bg-hover/60',
                !inMonth && 'bg-sunken/50',
              )}
            >
              <span
                className={cn(
                  'inline-flex size-7 items-center justify-center rounded-full text-[13px] tabular-nums sm:size-6 sm:text-[12.5px]',
                  !inMonth && 'text-ink-3/70',
                  today && !selected && 'font-semibold text-scheduled-ink',
                  selected && 'bg-primary font-semibold text-primary-ink',
                )}
              >
                {format(day, 'd')}
              </span>

              {/* Phones: status dots only */}
              {statuses.length > 0 && (
                <span className="flex gap-0.5 sm:hidden" aria-hidden>
                  {statuses.map((s) => (
                    <StatusDot key={s} status={s} className="size-1" />
                  ))}
                </span>
              )}

              {/* Larger screens: the first few posts with their times */}
              <span className="hidden w-full space-y-0.5 sm:block" aria-hidden>
                {posts.slice(0, MAX_ITEMS).map((p) => (
                  <span key={p.id} className="flex items-center gap-1.5 truncate rounded px-1 py-px text-[11.5px] text-ink-2">
                    <StatusDot status={p.status} />
                    <span className="tabular-nums">{formatTime(p.scheduledAt).replace(':00', '')}</span>
                    <span className="truncate text-ink-3">{p.content}</span>
                  </span>
                ))}
                {posts.length > MAX_ITEMS && (
                  <span className="block px-1 text-[11px] text-ink-3">+{posts.length - MAX_ITEMS} more</span>
                )}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
