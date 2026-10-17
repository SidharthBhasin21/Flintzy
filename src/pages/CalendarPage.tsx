import { addMonths, format, isValid, parse, startOfMonth } from 'date-fns'
import { CalendarPlus, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSearchParams } from 'react-router'
import { useLiveSetSearchParams } from '@/lib/useLiveSetSearchParams'
import { StatePanel } from '@/components/shared/StatePanel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MonthGrid } from '@/features/calendar/components/MonthGrid'
import { usePostActions } from '@/features/posts/actions/context'
import { DaySection } from '@/features/posts/components/DayGroupList'
import { FilterBar } from '@/features/posts/components/FilterBar'
import { LoadError } from '@/features/posts/components/QueueStates'
import { useNow } from '@/features/posts/hooks/useNow'
import { usePostFilters } from '@/features/posts/hooks/usePostFilters'
import { usePosts } from '@/features/posts/store/context'
import { applyFilters } from '@/features/posts/utils/filters'
import { groupByDay } from '@/features/posts/utils/grouping'
import { dayKey, parseDayKey } from '@/lib/dates'
import { pluralize } from '@/lib/utils'
import { PageHeader } from './PageHeader'

export function CalendarPage() {
  const { status, posts, error, reload } = usePosts()
  const { filters, setFilters, replaceFilters, clearFilters } = usePostFilters()
  const actions = usePostActions()
  const [params] = useSearchParams()
  const setParams = useLiveSetSearchParams()
  const now = useNow()

  const parsedMonth = parse(params.get('month') ?? '', 'yyyy-MM', now)
  const month = startOfMonth(isValid(parsedMonth) ? parsedMonth : now)
  const selectedKey = params.get('day') ?? dayKey(now)
  const selectedDate = parseDayKey(selectedKey)

  // The calendar is itself a date picker, so the date-range filter is ignored here.
  const filtered = applyFilters(posts, filters, now, { ignoreRange: true })
  const groups = groupByDay(filtered)
  const postsByDay = new Map(groups.map((g) => [g.key, g.posts]))
  const monthCount = groups
    .filter((g) => format(g.date, 'yyyy-MM') === format(month, 'yyyy-MM'))
    .reduce((n, g) => n + g.posts.length, 0)
  const selectedGroup = groups.find((g) => g.key === selectedKey)

  const setView = (patch: { month?: Date; day?: string }) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (patch.month) next.set('month', format(patch.month, 'yyyy-MM'))
        if (patch.day) next.set('day', patch.day)
        return next
      },
      { replace: true },
    )

  const goToToday = () => setView({ month: startOfMonth(now), day: dayKey(now) })

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 pt-6 pb-16 sm:px-6 lg:px-10 lg:pt-10">
      <PageHeader
        title="Calendar"
        summary={status === 'ready' ? `${pluralize(monthCount, 'post')} in ${format(month, 'MMMM')}` : ' '}
      />

      <div className="mt-5">
        <FilterBar
          posts={posts}
          filters={filters}
          onChange={setFilters}
          onReplace={replaceFilters}
          onClear={clearFilters}
          resultCount={filtered.length}
          showDateFilter={false}
        />
      </div>

      <div className="mt-6 mb-3 flex items-center gap-2">
        <h2 className="mr-auto text-[17px] font-semibold tracking-tight" aria-live="polite">
          {format(month, 'MMMM yyyy')}
        </h2>
        <Button variant="secondary" size="md" onClick={goToToday}>
          Today
        </Button>
        <Button variant="secondary" size="icon" aria-label="Previous month" onClick={() => setView({ month: addMonths(month, -1) })}>
          <ChevronLeft strokeWidth={1.75} />
        </Button>
        <Button variant="secondary" size="icon" aria-label="Next month" onClick={() => setView({ month: addMonths(month, 1) })}>
          <ChevronRight strokeWidth={1.75} />
        </Button>
      </div>

      {status === 'error' ? (
        <LoadError message={error} onRetry={reload} />
      ) : status === 'loading' ? (
        <Skeleton className="h-[380px] w-full rounded-xl sm:h-[620px]" />
      ) : (
        <>
          <MonthGrid
            month={month}
            selectedKey={selectedKey}
            postsByDay={postsByDay}
            onSelect={(key) => {
              const date = parseDayKey(key)
              setView({ day: key, month: startOfMonth(date) })
            }}
          />
          <div className="mt-2">
            {selectedGroup ? (
              <DaySection group={selectedGroup} now={now} />
            ) : (
              <StatePanel
                icon={CalendarPlus}
                title={`Nothing on ${format(selectedDate, 'EEEE, MMM d')}`}
                description="Pick another day, or schedule something new."
                action={<Button onClick={actions.create}>New post</Button>}
                className="py-12"
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}
