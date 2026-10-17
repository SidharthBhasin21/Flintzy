import { FilterBar } from '@/features/posts/components/FilterBar'
import { FailedBanner } from '@/features/posts/components/FailedBanner'
import { DayGroupList } from '@/features/posts/components/DayGroupList'
import { PostListSkeleton } from '@/features/posts/components/PostListSkeleton'
import { EmptyQueue, LoadError, NoResults } from '@/features/posts/components/QueueStates'
import { usePostActions } from '@/features/posts/actions/context'
import { useNow } from '@/features/posts/hooks/useNow'
import { usePostFilters } from '@/features/posts/hooks/usePostFilters'
import { usePosts } from '@/features/posts/store/context'
import { applyFilters } from '@/features/posts/utils/filters'
import { splitQueue } from '@/features/posts/utils/grouping'
import { relativeTime } from '@/lib/dates'
import { PageHeader } from './PageHeader'

export function QueuePage() {
  const { status, posts, error, reload } = usePosts()
  const { filters, setFilters, replaceFilters, clearFilters } = usePostFilters()
  const actions = usePostActions()
  const now = useNow()

  const filtered = applyFilters(posts, filters, now)
  const { upcoming, past } = splitQueue(filtered, now)
  const failedCount = posts.filter((p) => p.status === 'failed').length
  const showingOnlyFailed = filters.statuses.length === 1 && filters.statuses[0] === 'failed'

  const next = posts
    .filter((p) => p.status === 'scheduled' && new Date(p.scheduledAt) > now)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))

  const summary =
    status !== 'ready'
      ? ' '
      : next.length
        ? `${next.length} scheduled · next goes out ${relativeTime(next[0].scheduledAt, now)}`
        : 'Nothing scheduled'

  return (
    <div className="mx-auto w-full max-w-[920px] px-4 pt-6 sm:px-6 lg:px-10 lg:pt-10">
      <PageHeader title="Queue" summary={summary} />

      {status === 'ready' && failedCount > 0 && !showingOnlyFailed && (
        <FailedBanner count={failedCount} onReview={() => setFilters({ statuses: ['failed'] })} />
      )}

      <div className="mt-5">
        <FilterBar
          posts={posts}
          filters={filters}
          onChange={setFilters}
          onReplace={replaceFilters}
          onClear={clearFilters}
          resultCount={filtered.length}
        />
      </div>

      <div className="mt-1">
        {status === 'loading' && <PostListSkeleton />}
        {status === 'error' && <LoadError message={error} onRetry={reload} />}
        {status === 'ready' &&
          (posts.length === 0 ? (
            <EmptyQueue onCreate={actions.create} />
          ) : filtered.length === 0 ? (
            <NoResults query={filters.q} onClear={clearFilters} />
          ) : (
            <DayGroupList upcoming={upcoming} past={past} now={now} />
          ))}
      </div>
    </div>
  )
}
