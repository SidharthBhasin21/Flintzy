import { useState } from 'react'
import { Eye } from 'lucide-react'
import { PlatformIcon } from '@/components/platform/PlatformIcon'
import { MediaThumb } from '@/components/shared/MediaThumb'
import { PLATFORMS, PLATFORM_ORDER, WORKSPACE } from '@/lib/constants'
import { formatLocal } from '@/lib/dates'
import { cn } from '@/lib/utils'
import type { Platform } from '@/features/posts/types'

/** Splits text at a grapheme count so the overflow can be highlighted. */
function splitAt(text: string, limit: number): [string, string] {
  const graphemes = Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (s) => s.segment)
  return [graphemes.slice(0, limit).join(''), graphemes.slice(limit).join('')]
}

export function PostPreview({
  content,
  platforms,
  mediaUrl,
  scheduledAt,
}: {
  content: string
  platforms: Platform[]
  mediaUrl: string
  scheduledAt: string | null
}) {
  const ordered = PLATFORM_ORDER.filter((p) => platforms.includes(p))
  const [chosen, setChosen] = useState<Platform | null>(null)
  const active = chosen && ordered.includes(chosen) ? chosen : ordered[0]

  if (!active) {
    return (
      <div className="flex flex-col items-center gap-2 py-14 text-center text-[13px] text-ink-3">
        <Eye className="size-5" strokeWidth={1.5} />
        Choose a platform to see how the post will look.
      </div>
    )
  }

  const [fits, overflow] = splitAt(content.trim() || 'Your caption will appear here.', PLATFORMS[active].charLimit)
  const imageFirst = active === 'instagram' || active === 'tiktok'
  const image = mediaUrl.trim() && (
    <MediaThumb
      src={mediaUrl.trim()}
      className={cn('w-full', active === 'tiktok' ? 'aspect-[4/5]' : imageFirst ? 'aspect-square' : 'aspect-[16/10] rounded-lg')}
    />
  )

  return (
    <div className="space-y-3">
      {ordered.length > 1 && (
        <div role="tablist" aria-label="Preview platform" className="flex gap-1">
          {ordered.map((p) => (
            <button
              key={p}
              role="tab"
              type="button"
              aria-selected={p === active}
              onClick={() => setChosen(p)}
              className={cn(
                'inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-[12.5px] font-medium transition-colors',
                p === active ? 'bg-selected text-ink' : 'text-ink-2 hover:bg-hover',
              )}
            >
              <PlatformIcon decorative platform={p} className="size-3.5" />
              {PLATFORMS[p].label}
            </button>
          ))}
        </div>
      )}

      <article className="overflow-hidden rounded-xl border border-line bg-surface">
        <header className="flex items-center gap-2.5 px-3.5 pt-3 pb-2.5">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-[#2b2620] text-[11px] font-semibold text-[#f3e9dc]">
            HC
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13px] font-semibold">{WORKSPACE.name}</p>
            <p className="truncate text-[12px] text-ink-3">
              {PLATFORMS[active].handle}
              {scheduledAt && ` · ${formatLocal(scheduledAt, 'MMM d, h:mm a')}`}
            </p>
          </div>
          <PlatformIcon platform={active} className="size-4" />
        </header>
        {imageFirst && image}
        <p
          className={cn(
            'px-3.5 text-[13.5px] leading-relaxed whitespace-pre-wrap break-words',
            imageFirst ? 'py-3' : 'pb-3',
            !content.trim() && 'text-ink-3',
          )}
        >
          {fits}
          {overflow && (
            <mark className="rounded-sm bg-failed-bg text-failed-ink" title="Over the character limit">
              {overflow}
            </mark>
          )}
        </p>
        {!imageFirst && image && <div className="px-3.5 pb-3.5">{image}</div>}
      </article>
      <p className="text-[12px] text-ink-3">An approximation. Each network may crop images and truncate long captions.</p>
    </div>
  )
}
