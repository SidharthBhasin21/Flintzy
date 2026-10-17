import { format } from 'date-fns'
import { FailedBanner } from '@/features/posts/components/FailedBanner'
import { FilterBar } from '@/features/posts/components/FilterBar'
import { OverviewRail } from '@/features/posts/components/OverviewRail'
import { EmptyQueue, LoadError, NoResults } from '@/features/posts/components/QueueStates'
import { Timeline } from '@/features/posts/components/Timeline'
import { TimelineSkeleton } from '@/features/posts/components/TimelineSkeleton'
import { usePostActions } from '@/features/posts/actions/context'
import { useNow } from '@/features/posts/hooks/useNow'
import { usePostFilters } from '@/features/posts/hooks/usePostFilters'
import { usePosts } from '@/features/posts/store/context'
import { applyFilters, writeFilters } from '@/features/posts/utils/filters'
import { splitQueue } from '@/features/posts/utils/grouping'
import { pluralize } from '@/lib/utils'
import { PageHeader } from './PageHeader'

export function QueuePage() {
  const { status, posts, error, reload } = usePosts()
  const { filters, setFilters, clearFilters } = usePostFilters()
  const actions = usePostActions()
  const now = useNow()

  const filtered = applyFilters(posts, filters, now)
  const { upcoming, past } = splitQueue(filtered, now)
  const failedCount = posts.filter((p) => p.status === 'failed').length
  const scheduled = posts
    .filter((p) => p.status === 'scheduled')
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
  const showingOnlyFailed = filters.statuses.length === 1 && filters.statuses[0] === 'failed'

  const summary =
    status !== 'ready'
      ? ' '
      : scheduled.length
        ? `${pluralize(scheduled.length, 'post')} scheduled through ${format(new Date(scheduled[scheduled.length - 1].scheduledAt), 'EEEE, MMM d')}`
        : 'Nothing scheduled yet'

  return (
    <div className="mx-auto grid max-w-[1240px] gap-x-14 px-4 pt-8 sm:px-6 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0">
        <PageHeader title="Queue" summary={summary} />

        {status === 'ready' && failedCount > 0 && !showingOnlyFailed && (
          <div className="lg:hidden">
            <FailedBanner count={failedCount} onReview={() => setFilters({ statuses: ['failed'] })} />
          </div>
        )}

        <div className="mt-6">
          <FilterBar
            posts={posts}
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            resultCount={filtered.length}
          />
        </div>

        <div className="mt-2">
          {status === 'loading' && <TimelineSkeleton />}
          {status === 'error' && <LoadError message={error} onRetry={reload} />}
          {status === 'ready' &&
            (posts.length === 0 ? (
              <EmptyQueue onCreate={actions.create} />
            ) : filtered.length === 0 ? (
              <NoResults query={filters.q} onClear={clearFilters} />
            ) : (
              <Timeline
                upcoming={upcoming}
                past={past}
                now={now}
                animateKey={writeFilters(new URLSearchParams(), { ...filters, q: '' }).toString()}
              />
            ))}
        </div>
      </div>

      <OverviewRail
        now={now}
        className="sticky top-[calc(var(--header-h)+2.5rem)] hidden self-start pt-1 lg:block"
      />
    </div>
  )
}
