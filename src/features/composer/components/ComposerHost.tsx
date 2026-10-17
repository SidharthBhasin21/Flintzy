import { lazy, Suspense, useState, type ReactNode } from 'react'
import { PenLine } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Dialog, DialogDescription, DialogTitle, SheetCloseButton, SheetContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useIsWide } from '@/components/shared/useMediaQuery'
import { useOverlayParam } from '@/features/posts/hooks/useOverlayParam'
import { usePosts } from '@/features/posts/store/context'
import type { Post } from '@/features/posts/types'

// The form (validation, preview, media library) is only fetched when it's shown.
const Composer = lazy(() => import('./Composer').then((m) => ({ default: m.Composer })))

/**
 * Decides where the composer lives:
 * - ≥1280px: a permanent panel on the right (create by default, edit via ?edit=).
 * - Smaller: a sheet opened by ?compose=new or ?edit=<id>.
 */
export function ComposerHost() {
  const isWide = useIsWide()
  const { posts, status } = usePosts()
  const compose = useOverlayParam('compose')
  const edit = useOverlayParam('edit')
  const detail = useOverlayParam('post')

  const editing = edit.value ? posts.find((p) => p.id === edit.value && p.status !== 'published') : undefined
  const waitingForPost = Boolean(edit.value) && status === 'loading'
  const mode = editing ? 'edit' : 'create'

  const viewPost = (post: Post) => detail.open(post.id)

  if (isWide) {
    return (
      <aside
        aria-label={mode === 'edit' ? 'Edit post' : 'New post'}
        className="sticky top-0 flex h-dvh w-[400px] shrink-0 flex-col border-l border-line bg-surface"
      >
        <PanelHeader mode={mode} onCancel={editing ? edit.close : undefined} />
        {waitingForPost ? (
          <ComposerSkeleton />
        ) : (
          <Suspense fallback={<ComposerSkeleton />}>
            <Composer
              key={editing?.id ?? 'new'}
              post={editing}
              onView={viewPost}
              onDone={editing ? edit.close : undefined}
              onCancel={editing ? edit.close : undefined}
            />
          </Suspense>
        )}
      </aside>
    )
  }

  const open = compose.value === 'new' || Boolean(editing)
  const close = editing ? edit.close : compose.close

  return (
    <ComposerSheet open={open} mode={mode} onClose={close}>
      {(onDirtyChange) => (
        <Composer
          key={editing?.id ?? 'new'}
          post={editing}
          onDirtyChange={onDirtyChange}
          onDone={close}
          onView={viewPost}
        />
      )}
    </ComposerSheet>
  )
}

function PanelHeader({ mode, onCancel }: { mode: 'create' | 'edit'; onCancel?: () => void }) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-3 px-5">
      <h2 className="flex items-center gap-2 text-[15px] font-semibold tracking-tight">
        <PenLine className="size-4 text-ink-2" strokeWidth={1.75} aria-hidden />
        {mode === 'edit' ? 'Edit post' : 'New post'}
      </h2>
      {onCancel && (
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Back to new post
        </Button>
      )}
    </header>
  )
}

function ComposerSheet({
  open,
  mode,
  onClose,
  children,
}: {
  open: boolean
  mode: 'create' | 'edit'
  onClose: () => void
  children: (onDirtyChange: (dirty: boolean) => void) => ReactNode
}) {
  const [dirty, setDirty] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const requestClose = () => {
    if (dirty) setConfirming(true)
    else onClose()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => !next && requestClose()}>
        <SheetContent side="right" aria-describedby={undefined}>
          <header className="flex h-14 shrink-0 items-center justify-between gap-3 pr-3 pl-5">
            <DialogTitle className="text-[15px] font-semibold tracking-tight">
              {mode === 'edit' ? 'Edit post' : 'New post'}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Write a post, choose platforms and pick when it should go out.
            </DialogDescription>
            <SheetCloseButton />
          </header>
          {open && <Suspense fallback={<ComposerSkeleton />}>{children(setDirty)}</Suspense>}
        </SheetContent>
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
                onClose()
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
    <div className="space-y-5 px-5 pt-1" aria-busy>
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-36 w-full" />
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[92px]" />
        ))}
      </div>
      <Skeleton className="h-9 w-full" />
    </div>
  )
}
