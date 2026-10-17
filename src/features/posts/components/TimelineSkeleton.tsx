import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { RAIL_GRID } from './TimelineRow'

export function TimelineSkeleton() {
  return (
    <div role="status" aria-label="Loading posts" className="pb-20">
      {[4, 3].map((rows, g) => (
        <div key={g}>
          <div className="flex items-baseline gap-3 pt-6 pb-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className={cn(RAIL_GRID, 'pb-2')} style={{ opacity: 1 - i * 0.18 }}>
              <Skeleton className="mt-3.5 ml-auto h-3.5 w-9" />
              <div className="relative flex justify-center">
                <span className="absolute inset-y-0 w-px bg-line" />
                <Skeleton className="relative mt-4 size-3 rounded-full" />
              </div>
              <div className="flex gap-4 px-3.5 py-3">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-[88%]" />
                  <Skeleton className="h-3.5 w-[60%]" />
                  <Skeleton className="mt-3 h-3 w-40" />
                </div>
                <Skeleton className="size-16 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ))}
      <span className="sr-only">Loading posts…</span>
    </div>
  )
}
