import { createContext, useContext } from 'react'
import type { Post } from '../types'

export interface PostActions {
  view: (post: Post) => void
  edit: (post: Post) => void
  create: () => void
  retry: (post: Post) => void
  requestDelete: (post: Post) => void
  copy: (post: Post) => void
}

export const PostActionsContext = createContext<PostActions | null>(null)

export function usePostActions() {
  const ctx = useContext(PostActionsContext)
  if (!ctx) throw new Error('usePostActions must be used inside <PostActionsProvider>')
  return ctx
}
