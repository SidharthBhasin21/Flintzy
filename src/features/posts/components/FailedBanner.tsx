import { CircleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { pluralize } from '@/lib/utils'

export function FailedBanner({ count, onReview }: { count: number; onReview: () => void }) {
  return (
    <div className="mt-5 flex items-center gap-3 rounded-xl border border-failed-dot/20 bg-failed-bg/60 py-2 pr-2 pl-3 text-[13px] text-failed-ink">
      <CircleAlert aria-hidden className="size-4 shrink-0" strokeWidth={2} />
      <p className="flex-1">
        <span className="font-medium">{pluralize(count, 'post')} failed to publish.</span>{' '}
        <span className="max-sm:hidden">Retry them or edit and reschedule.</span>
      </p>
      <Button size="sm" variant="ghost" onClick={onReview} className="text-failed-ink hover:bg-failed-bg hover:text-failed-ink">
        Review
      </Button>
    </div>
  )
}
