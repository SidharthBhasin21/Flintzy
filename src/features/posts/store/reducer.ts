import type { Post } from '../types'

export type PendingKind = 'retry'

export interface PostsState {
  status: 'loading' | 'ready' | 'error'
  posts: Post[]
  error: string | null
  /** In-flight mutations per post, used to show progress without blocking the list. */
  pending: Record<string, PendingKind>
}

export type PostsAction =
  | { type: 'load/start' }
  | { type: 'load/success'; posts: Post[] }
  | { type: 'load/failure'; error: string }
  | { type: 'post/upsert'; post: Post }
  | { type: 'post/remove'; id: string }
  | { type: 'pending/set'; id: string; kind: PendingKind }
  | { type: 'pending/clear'; id: string }

export const initialPostsState: PostsState = {
  status: 'loading',
  posts: [],
  error: null,
  pending: {},
}

export function postsReducer(state: PostsState, action: PostsAction): PostsState {
  switch (action.type) {
    case 'load/start':
      return { ...state, status: 'loading', error: null }
    case 'load/success':
      return { ...state, status: 'ready', posts: action.posts, error: null }
    case 'load/failure':
      return { ...state, status: 'error', error: action.error }
    case 'post/upsert': {
      const exists = state.posts.some((p) => p.id === action.post.id)
      return {
        ...state,
        posts: exists
          ? state.posts.map((p) => (p.id === action.post.id ? action.post : p))
          : [...state.posts, action.post],
      }
    }
    case 'post/remove':
      return { ...state, posts: state.posts.filter((p) => p.id !== action.id) }
    case 'pending/set':
      return { ...state, pending: { ...state.pending, [action.id]: action.kind } }
    case 'pending/clear': {
      const pending = { ...state.pending }
      delete pending[action.id]
      return { ...state, pending }
    }
  }
}
