import { ImagePlus, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MEDIA_LIBRARY } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { isValidMediaUrl } from '../utils/validation'

export function MediaField({
  value,
  onChange,
  onBrokenChange,
  invalid,
  describedBy,
}: {
  value: string
  onChange: (url: string) => void
  onBrokenChange: (broken: boolean) => void
  invalid?: boolean
  describedBy?: string
}) {
  const [libraryOpen, setLibraryOpen] = useState(false)
  const url = value.trim()
  const showPreview = url && isValidMediaUrl(url)
  const libraryItem = MEDIA_LIBRARY.find((m) => m.url === url)

  return (
    <div className="space-y-2.5">
      <div className="flex gap-2">
        <Input
          id="composer-media"
          type="url"
          inputMode="url"
          placeholder="https://… or pick from the library"
          value={libraryItem ? '' : value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-9"
        />
        <Popover open={libraryOpen} onOpenChange={setLibraryOpen}>
          <PopoverTrigger asChild>
            <Button variant="secondary" className="h-9">
              <ImagePlus strokeWidth={1.75} />
              Library
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[296px]" aria-label="Media library">
            <p className="px-1 pb-2 text-[12px] font-medium text-ink-3">Media library</p>
            <div className="grid grid-cols-4 gap-1.5">
              {MEDIA_LIBRARY.map((m) => (
                <button
                  key={m.url}
                  type="button"
                  aria-label={m.alt}
                  aria-pressed={m.url === url}
                  onClick={() => {
                    onChange(m.url)
                    setLibraryOpen(false)
                  }}
                  className={cn(
                    'aspect-square overflow-hidden rounded-md ring-offset-2 ring-offset-surface transition-[box-shadow,opacity] hover:opacity-90',
                    m.url === url && 'ring-2 ring-ink',
                  )}
                >
                  <img src={m.url} alt="" loading="lazy" className="size-full object-cover" />
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {showPreview && (
        <div className="flex items-center gap-3 rounded-lg border border-line bg-sunken/60 p-2 pr-1.5">
          <img
            key={url}
            src={url}
            alt=""
            onLoad={() => onBrokenChange(false)}
            onError={() => onBrokenChange(true)}
            className="size-12 shrink-0 rounded-md bg-selected object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-ink">{libraryItem?.alt ?? url.split('/').pop()}</p>
            <p className="truncate text-[12px] text-ink-3">{libraryItem ? 'From library' : new URL(url, location.origin).host}</p>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Remove image" onClick={() => onChange('')}>
            <X strokeWidth={1.75} />
          </Button>
        </div>
      )}
    </div>
  )
}
