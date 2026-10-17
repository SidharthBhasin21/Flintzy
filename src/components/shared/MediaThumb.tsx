import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

/** Square image that degrades to a quiet placeholder if the URL is broken. */
export function MediaThumb({ src, alt = '', className }: { src: string; alt?: string; className?: string }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const broken = failedSrc === src

  return (
    <span
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-md bg-sunken',
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]',
        className,
      )}
    >
      {broken ? (
        <ImageOff aria-label="Image unavailable" className="size-4 text-ink-3" strokeWidth={1.75} />
      ) : (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailedSrc(src)}
          className="size-full object-cover"
        />
      )}
    </span>
  )
}
