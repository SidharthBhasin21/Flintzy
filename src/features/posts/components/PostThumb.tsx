import { AlignLeft } from 'lucide-react'
import { MediaThumb } from '@/components/shared/MediaThumb'
import { cn } from '@/lib/utils'
import type { Post } from '../types'

/** Media thumbnail, or a quiet text marker for text-only posts. */
export function PostThumb({ post, className }: { post: Post; className?: string }) {
  if (post.mediaUrl) return <MediaThumb src={post.mediaUrl} className={className} />
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-md border border-line bg-sunken text-ink-3', className)}
    >
      <AlignLeft className="size-4" strokeWidth={1.5} />
    </span>
  )
}
