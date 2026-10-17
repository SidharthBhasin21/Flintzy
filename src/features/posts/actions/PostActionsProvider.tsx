import { useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useLiveSetSearchParams } from '@/lib/useLiveSetSearchParams'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useIsWide } from '@/components/shared/useMediaQuery'
import { PLATFORMS } from '@/lib/constants'
import { usePosts } from '../store/context'
import type { Post } from '../types'
import { PostDetailSheet } from '../components/PostDetailSheet'
import { PostActionsContext, type PostActions } from './context'

const listFormat = (items: string[]) => new Intl.ListFormat(undefined, { type: 'conjunction' }).format(items)

/**
 * One place for every post-level action, so rows, menus, the calendar and the
 * detail sheet behave identically. Also owns the delete confirmation.
 */
export function PostActionsProvider({ children }: { children: ReactNode }) {
  const { deletePost, retryPost } = usePosts()
  const setParams = useLiveSetSearchParams()
  const isWide = useIsWide()
  const [deleting, setDeleting] = useState<Post | null>(null)

  const patchParams = (patch: Record<string, string | null>, replace = false) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        for (const [key, value] of Object.entries(patch)) {
          if (value === null) next.delete(key)
          else next.set(key, value)
        }
        return next
      },
      { replace },
    )

  const focusComposer = () =>
    requestAnimationFrame(() => document.getElementById('composer-content')?.focus())

  const actions: PostActions = {
    view: (post) => patchParams({ post: post.id }),
    edit: (post) => {
      // Close details first so the composer never stacks on top of it.
      patchParams({ post: null, compose: null, edit: post.id }, true)
      if (isWide) focusComposer()
    },
    create: () => {
      if (isWide) {
        patchParams({ edit: null, compose: null }, true)
        focusComposer()
      } else {
        patchParams({ compose: 'new', edit: null })
      }
    },
    retry: (post) => void retryPost(post),
    requestDelete: (post) => setDeleting(post),
    copy: async (post) => {
      try {
        await navigator.clipboard.writeText(post.content)
        toast.success('Copied to clipboard')
      } catch {
        toast.error('Couldn’t copy. Your browser blocked clipboard access.')
      }
    },
  }

  const confirmDelete = () => {
    if (!deleting) return
    patchParams({ post: null, edit: null }, true)
    void deletePost(deleting)
    setDeleting(null)
  }

  const deleteDescription = !deleting
    ? ''
    : deleting.status === 'published'
      ? `This removes it from Flintzy only. The live post stays up on ${listFormat(deleting.platforms.map((p) => PLATFORMS[p].label))}.`
      : 'It will be removed from the queue and won’t be published. This can’t be undone.'

  return (
    <PostActionsContext value={actions}>
      {children}
      <PostDetailSheet />
      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent title="Delete this post?" description={deleteDescription}>
          <AlertDialogCancel asChild>
            <Button variant="ghost">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button variant="danger" onClick={confirmDelete}>
              Delete post
            </Button>
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </PostActionsContext>
  )
}
