import { Skeleton } from '@/components/ui/skeleton'

const GROUPS = [4, 3]

export function PostListSkeleton() {
  return (
    <div role="status" aria-label="Loading posts" className="pb-16">
      {GROUPS.map((rows, g) => (
        <div key={g}>
          <div className="flex items-center gap-2 pt-5 pb-3">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3.5 w-20" />
          </div>
          <div className="divide-y divide-line rounded-xl border border-line bg-surface">
            {Array.from({ length: rows }, (_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3" style={{ opacity: 1 - i * 0.18 }}>
                <Skeleton className="size-12 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-[85%]" />
                  <Skeleton className="h-3.5 w-[55%]" />
                </div>
                <Skeleton className="hidden h-4 w-12 md:block" />
                <Skeleton className="hidden h-8 w-16 md:block" />
                <Skeleton className="hidden h-[22px] w-20 rounded-full md:block" />
              </div>
            ))}
          </div>
        </div>
      ))}
      <span className="sr-only">Loading posts…</span>
    </div>
  )
}
