import { CalendarPlus, CloudOff, RotateCw, SearchX } from 'lucide-react'
import { StatePanel } from '@/components/shared/StatePanel'
import { Button } from '@/components/ui/button'

export function EmptyQueue({ onCreate }: { onCreate: () => void }) {
  return (
    <StatePanel
      icon={CalendarPlus}
      title="Nothing in the queue yet"
      description="Scheduled, published and failed posts show up here, grouped by day."
      action={
        <Button variant="primary" onClick={onCreate}>
          New post
        </Button>
      }
    />
  )
}

export function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <StatePanel
      icon={SearchX}
      title="No posts match"
      description={
        query.trim() ? (
          <>
            Nothing matches “<span className="text-ink">{query.trim()}</span>” with the current filters.
          </>
        ) : (
          'Try a different platform, status or date range.'
        )
      }
      action={<Button onClick={onClear}>Clear filters</Button>}
    />
  )
}

export function LoadError({ message, onRetry }: { message: string | null; onRetry: () => void }) {
  return (
    <StatePanel
      tone="danger"
      icon={CloudOff}
      title="Couldn’t load your posts"
      description={`${message ?? 'Something went wrong.'} Your scheduled posts are safe. This only affects what you see here.`}
      action={
        <Button onClick={onRetry}>
          <RotateCw strokeWidth={1.75} />
          Try again
        </Button>
      }
    />
  )
}
