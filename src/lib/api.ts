import seed from '@/data/posts.json'
import type { Post, PostInput } from '@/features/posts/types'

/*
 * Mock backend. Nothing leaves the browser.
 *
 * - Seed dates are rebased so the queue always looks "live": every post keeps
 *   its distance from now that it had relative to SEED_REFERENCE.
 * - Writes persist to sessionStorage, so a reload keeps your changes and a new
 *   tab starts fresh.
 * - Append `?mock=error`, `?mock=empty` or `?mock=slow` to the URL to exercise
 *   the failure, empty and slow-network states.
 */

const SEED_REFERENCE = Date.parse('2026-10-17T06:00:00.000Z')
const STORAGE_KEY = 'flintzy:posts:v1'
const QUARTER_HOUR = 15 * 60 * 1000

export class ApiError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

type MockMode = 'error' | 'empty' | 'slow' | null

const mockMode: MockMode = (() => {
  const value = new URLSearchParams(window.location.search).get('mock')
  return value === 'error' || value === 'empty' || value === 'slow' ? value : null
})()

const latency = (base: number) =>
  new Promise<void>((resolve) =>
    setTimeout(resolve, (mockMode === 'slow' ? base * 4 : base) + Math.random() * 150),
  )

function rebaseSeed(): Post[] {
  // Round to a quarter hour so rebased times stay on :00/:15/:30/:45.
  const shift = Math.round((Date.now() - SEED_REFERENCE) / QUARTER_HOUR) * QUARTER_HOUR
  return (seed as Post[]).map((post) => ({
    ...post,
    scheduledAt: new Date(Date.parse(post.scheduledAt) + shift).toISOString(),
  }))
}

function load(): Post[] {
  if (mockMode === 'empty') return []
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored) as Post[]
  } catch {
    // Storage unavailable (private mode, blocked cookies): fall through to seed.
  }
  return rebaseSeed()
}

let db: Post[] = load()

function persist() {
  if (mockMode === 'empty') return
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Non-fatal: the session simply won't survive a reload.
  }
}

const clone = <T>(value: T): T => structuredClone(value)

function findOrThrow(id: string): Post {
  const post = db.find((p) => p.id === id)
  if (!post) throw new ApiError('This post no longer exists.')
  return post
}

const newId = () => `pst_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`

/** Errors that a straight retry cannot fix. The mock fails these again. */
const isPermanentFailure = (message = '') => /expired|reconnect|revoked/i.test(message)

let listCalls = 0

export const api = {
  async listPosts(): Promise<Post[]> {
    await latency(650)
    listCalls++
    // In error mode, fail the first load so "Try again" demonstrably recovers.
    if (mockMode === 'error' && listCalls === 1) {
      throw new ApiError('The post service did not respond in time.')
    }
    return clone(db)
  },

  async createPost(input: PostInput): Promise<Post> {
    await latency(500)
    const post: Post = { id: newId(), ...input, status: 'scheduled' }
    db = [...db, post]
    persist()
    return clone(post)
  },

  /** Editing re-queues the post: a failed post becomes scheduled again. */
  async updatePost(id: string, input: PostInput): Promise<Post> {
    await latency(500)
    const existing = findOrThrow(id)
    if (existing.status === 'published') {
      throw new ApiError('Published posts can no longer be edited.')
    }
    const updated: Post = { ...existing, ...input, status: 'scheduled', errorMessage: undefined }
    db = db.map((p) => (p.id === id ? updated : p))
    persist()
    return clone(updated)
  },

  async deletePost(id: string): Promise<void> {
    await latency(400)
    findOrThrow(id)
    db = db.filter((p) => p.id !== id)
    persist()
  },

  /** Attempts to publish a failed post immediately. */
  async retryPost(id: string): Promise<Post> {
    await latency(1100)
    const post = findOrThrow(id)
    if (post.status !== 'failed') return clone(post)
    if (isPermanentFailure(post.errorMessage)) {
      throw new ApiError(post.errorMessage ?? 'Publishing failed again.')
    }
    const published: Post = { ...post, status: 'published', errorMessage: undefined }
    db = db.map((p) => (p.id === id ? published : p))
    persist()
    return clone(published)
  },
}
