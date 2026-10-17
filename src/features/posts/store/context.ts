import { createContext, useContext } from 'react'
import type { Post, PostInput } from '../types'
import type { PostsState } from './reducer'

export interface PostsContextValue extends PostsState {
  reload: () => void
  createPost: (input: PostInput) => Promise<Post>
  updatePost: (id: string, input: PostInput) => Promise<Post>
  deletePost: (post: Post) => Promise<void>
  retryPost: (post: Post) => Promise<void>
}

export const PostsContext = createContext<PostsContextValue | null>(null)

export function usePosts() {
  const ctx = useContext(PostsContext)
  if (!ctx) throw new Error('usePosts must be used inside <PostsProvider>')
  return ctx
}
