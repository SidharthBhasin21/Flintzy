import { ImagePlus, X } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MEDIA_LIBRARY } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { isValidMediaUrl } from '../utils/validation'

/** "Add image" button: pick from the library or paste a URL. */
export function MediaPicker({
  value,
  onChange,
  invalid,
  describedBy,
}: {
  value: string
  onChange: (url: string) => void
  invalid?: boolean
  describedBy?: string
}) {
  const [open, setOpen] = useState(false)
  const [draftUrl, setDraftUrl] = useState('')

  const choose = (url: string) => {
    onChange(url)
    setDraftUrl('')
    setOpen(false)
  }

  const submitUrl = (e: FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (draftUrl.trim()) choose(draftUrl.trim())
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id="composer-media"
          variant="ghost"
          size="sm"
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className={cn('-ml-1.5 text-ink-2', invalid && 'text-failed-ink')}
        >
          <ImagePlus strokeWidth={1.75} />
          {value ? 'Replace image' : 'Add image'}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[312px] p-3">
        <p className="mb-2 text-[12px] font-medium text-ink-3">Media library</p>
        <div className="grid grid-cols-4 gap-1.5">
          {MEDIA_LIBRARY.map((m) => (
            <button
              key={m.url}
              type="button"
              aria-label={m.alt}
              aria-pressed={m.url === value}
              onClick={() => choose(m.url)}
              className={cn(
                'aspect-square overflow-hidden rounded-md ring-offset-2 ring-offset-surface transition-opacity hover:opacity-85',
                m.url === value && 'ring-2 ring-accent',
              )}
            >
              <img src={m.url} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
        {/* A nested <form> is invalid inside the composer form, so handle Enter manually. */}
        <div className="mt-3 border-t border-line pt-3">
          <label htmlFor="media-url" className="mb-1.5 block text-[12px] font-medium text-ink-3">
            Or paste an image URL
          </label>
          <div className="flex gap-1.5">
            <Input
              id="media-url"
              type="url"
              inputMode="url"
              placeholder="https://"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submitUrl(e)}
            />
            <Button onClick={submitUrl} disabled={!draftUrl.trim()}>
              Add
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

/** Thumbnail of the attached image, reporting load failures back to the form. */
export function MediaAttachment({
  url,
  onRemove,
  onBrokenChange,
}: {
  url: string
  onRemove: () => void
  onBrokenChange: (broken: boolean) => void
}) {
  if (!isValidMediaUrl(url)) return null
  const library = MEDIA_LIBRARY.find((m) => m.url === url)
  return (
    <div className="group relative inline-block">
      <img
        key={url}
        src={url}
        alt={library?.alt ?? 'Attached image'}
        onLoad={() => onBrokenChange(false)}
        onError={() => onBrokenChange(true)}
        className="size-24 rounded-lg bg-selected object-cover shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]"
      />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove image"
        className="absolute -top-2 -right-2 inline-flex size-6 items-center justify-center rounded-full border border-line bg-surface text-ink-2 shadow-pop transition-colors hover:text-ink"
      >
        <X className="size-3.5" strokeWidth={2} />
      </button>
    </div>
  )
}
