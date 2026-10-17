export type Platform = 'facebook' | 'instagram' | 'x' | 'tiktok'

export type PostStatus = 'scheduled' | 'published' | 'failed'

export interface Post {
  id: string
  content: string
  platforms: Platform[]
  mediaUrl?: string
  /** ISO 8601 instant in UTC. Converted to local time only at the display edge. */
  scheduledAt: string
  status: PostStatus
  errorMessage?: string
}

/** Fields a user can author. Status is always owned by the "server". */
export type PostInput = Pick<Post, 'content' | 'platforms' | 'mediaUrl' | 'scheduledAt'>
