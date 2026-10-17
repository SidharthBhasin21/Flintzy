import { useEffect, useReducer, type ReactNode } from 'react'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { PLATFORMS } from '@/lib/constants'
import type { Post, PostInput } from '../types'
import { PostsContext, type PostsContextValue } from './context'
import { initialPostsState, postsReducer } from './reducer'

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.'

const platformList = (post: Post) =>
  new Intl.ListFormat(undefined, { type: 'conjunction' }).format(
    post.platforms.map((p) => PLATFORMS[p].label),
  )

export function PostsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(postsReducer, initialPostsState)
  const [loadToken, reload] = useReducer((n: number) => n + 1, 0)

  useEffect(() => {
    let cancelled = false
    dispatch({ type: 'load/start' })
    api.listPosts().then(
      (posts) => {
        if (!cancelled) dispatch({ type: 'load/success', posts })
      },
      (error) => {
        if (!cancelled) dispatch({ type: 'load/failure', error: messageOf(error) })
      },
    )
    return () => {
      cancelled = true
    }
  }, [loadToken])

  const createPost = async (input: PostInput) => {
    const post = await api.createPost(input)
    dispatch({ type: 'post/upsert', post })
    return post
  }

  const updatePost = async (id: string, input: PostInput) => {
    const post = await api.updatePost(id, input)
    dispatch({ type: 'post/upsert', post })
    return post
  }

  /** Optimistic: the row disappears immediately and comes back if the request fails. */
  const deletePost = async (post: Post) => {
    dispatch({ type: 'post/remove', id: post.id })
    try {
      await api.deletePost(post.id)
      toast.success('Post deleted')
    } catch (error) {
      dispatch({ type: 'post/upsert', post })
      toast.error('Couldn’t delete the post', { description: messageOf(error) })
    }
  }

  /**
   * Optimistic: the post flips to Published straight away while the request
   * runs. On failure the original post comes back with the latest error.
   */
  const retryPost = async (post: Post) => {
    if (state.pending[post.id]) return
    dispatch({ type: 'pending/set', id: post.id, kind: 'retry' })
    dispatch({ type: 'post/upsert', post: { ...post, status: 'published', errorMessage: undefined } })
    try {
      const confirmed = await api.retryPost(post.id)
      dispatch({ type: 'post/upsert', post: confirmed })
      toast.success(`Published to ${platformList(post)}`)
    } catch (error) {
      dispatch({ type: 'post/upsert', post: { ...post, errorMessage: messageOf(error) } })
      toast.error('Still couldn’t publish', { description: messageOf(error) })
    } finally {
      dispatch({ type: 'pending/clear', id: post.id })
    }
  }

  const value: PostsContextValue = {
    ...state,
    reload,
    createPost,
    updatePost,
    deletePost,
    retryPost,
  }

  return <PostsContext value={value}>{children}</PostsContext>
}
