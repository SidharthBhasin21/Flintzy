import { lazy, Suspense } from 'react'
import { Dialog, SheetContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useOverlayParam } from '../hooks/useOverlayParam'
import { usePosts } from '../store/context'

const Details = lazy(() => import('./PostDetails'))

export function PostDetailSheet() {
  const { value: id, close } = useOverlayParam('post')
  const { posts, pending, status } = usePosts()
  const post = id ? posts.find((p) => p.id === id) : undefined
  // Keep the sheet closed while loading or for stale links to deleted posts.
  const open = Boolean(post) && status === 'ready'

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <SheetContent side="right" aria-describedby={undefined}>
        {post && (
          <Suspense fallback={<DetailsSkeleton />}>
            <Details postId={post.id} busy={pending[post.id] === 'retry'} />
          </Suspense>
        )}
      </SheetContent>
    </Dialog>
  )
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4 p-5" aria-busy>
      <Skeleton className="h-6 w-32" />
      <Skeleton className="aspect-[16/10] w-full rounded-lg" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
