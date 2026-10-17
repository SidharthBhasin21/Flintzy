import { lazy, Suspense, useState } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogDescription, DialogTitle, SheetCloseButton } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useOverlayParam } from '@/features/posts/hooks/useOverlayParam'
import { usePosts } from '@/features/posts/store/context'
import type { Post } from '@/features/posts/types'

// The form (validation, preview, media library) is only fetched when it's opened.
const Composer = lazy(() => import('./Composer').then((m) => ({ default: m.Composer })))

/**
 * The composer is a focused, centred workspace: ?compose=new creates a post,
 * ?edit=<id> edits one. Full screen on phones.
 */
export function ComposerHost() {
  const { posts } = usePosts()
  const compose = useOverlayParam('compose')
  const edit = useOverlayParam('edit')
  const detail = useOverlayParam('post')
  const [dirty, setDirty] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const editing = edit.value ? posts.find((p) => p.id === edit.value && p.status !== 'published') : undefined
  const open = compose.value === 'new' || Boolean(editing)
  const close = editing ? edit.close : compose.close
  const viewPost = (post: Post) => detail.open(post.id)

  const requestClose = () => {
    if (dirty) setConfirming(true)
    else close()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-overlay backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
          <DialogPrimitive.Content
            aria-describedby={undefined}
            className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-surface outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-dialog-in md:inset-auto md:top-1/2 md:left-1/2 md:h-[min(760px,calc(100dvh-48px))] md:w-[min(1040px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:border md:border-line md:shadow-pop"
          >
            <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line pr-3 pl-5 sm:pl-7">
              <DialogTitle className="text-[17px] font-semibold tracking-[-0.02em]">
                {editing ? 'Edit post' : 'New post'}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Write a post, choose platforms and pick when it should go out.
              </DialogDescription>
              {editing?.status === 'failed' && (
                <span className="rounded-full bg-failed-bg px-2 py-0.5 text-[11.5px] font-medium text-failed-ink">
                  Rescheduling a failed post
                </span>
              )}
              <SheetCloseButton className="ml-auto" />
            </header>
            {open && (
              <Suspense fallback={<ComposerSkeleton />}>
                <Composer
                  key={editing?.id ?? 'new'}
                  post={editing}
                  onDirtyChange={setDirty}
                  onDone={close}
                  onCancel={requestClose}
                  onView={viewPost}
                />
              </Suspense>
            )}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </Dialog>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent
          title="Discard this draft?"
          description="You have unsaved changes. Closing now will lose them."
        >
          <AlertDialogCancel asChild>
            <Button variant="ghost">Keep editing</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="danger"
              onClick={() => {
                setDirty(false)
                close()
              }}
            >
              Discard
            </Button>
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ComposerSkeleton() {
  return (
    <div className="grid flex-1 md:grid-cols-[1fr_380px]" aria-busy>
      <div className="space-y-6 p-7">
        <div className="flex gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-9 w-24 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-[220px] w-full rounded-xl" />
        <Skeleton className="h-9 w-72" />
      </div>
      <div className="hidden border-l border-line bg-sunken/70 p-5 md:block">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  )
}
