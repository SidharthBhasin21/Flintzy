import { lazy, Suspense } from 'react'
import { Dialog, SheetContent } from '@/components/ui/dialog'
import type { Post } from '../types'
import type { PostFilters } from '../utils/filters'

const SheetBody = lazy(() => import('./FilterSheetBody'))

/**
 * Mobile filters. Changes are staged in a draft and applied together, with a
 * live count so people know what they'll get before committing.
 */
export function FilterSheet({
  open,
  onOpenChange,
  posts,
  filters,
  onApply,
  showDateFilter,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  posts: Post[]
  filters: PostFilters
  onApply: (next: PostFilters) => void
  showDateFilter: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom">
        {open && (
          <Suspense fallback={<div className="h-[60dvh]" />}>
            <SheetBody
              posts={posts}
              initial={filters}
              showDateFilter={showDateFilter}
              onApply={(next) => {
                onApply(next)
                onOpenChange(false)
              }}
            />
          </Suspense>
        )}
      </SheetContent>
    </Dialog>
  )
}
