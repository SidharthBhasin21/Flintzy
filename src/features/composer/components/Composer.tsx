import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { format } from 'date-fns'
import { CircleAlert, Eye, Loader2, PenLine } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { PLATFORMS } from '@/lib/constants'
import { localInputsToUtcIso } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { usePosts } from '@/features/posts/store/context'
import type { Post } from '@/features/posts/types'
import { useComposerForm } from '../hooks/useComposerForm'
import { platformUsage, toPostInput, type ComposerField } from '../utils/validation'
import { Field } from './Field'
import { LimitMeters } from './LimitMeters'
import { MediaAttachment, MediaPicker } from './MediaAttach'
import { PlatformChips } from './PlatformChips'
import { PostPreview } from './PostPreview'
import { SchedulePicker, ScheduleSummary } from './SchedulePicker'

const FOCUS_TARGET: Record<ComposerField, string> = {
  content: 'composer-content',
  platforms: 'composer-platforms',
  mediaUrl: 'composer-media',
  schedule: 'composer-date',
}

const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

const describedBy = (id: string, error?: string) => (error ? `${id}-error` : undefined)

interface ComposerProps {
  /** When set, the composer edits this post instead of creating one. */
  post?: Post
  onDone?: (post: Post) => void
  onCancel?: () => void
  onDirtyChange?: (dirty: boolean) => void
  /** Called after a successful create so a toast can link to the new post. */
  onView?: (post: Post) => void
}

/**
 * Two panes: the form on the left and a live preview on the right. Phones get
 * a Write / Preview toggle in the footer instead.
 */
export function Composer({ post, onDone, onCancel, onDirtyChange, onView }: ComposerProps) {
  const { createPost, updatePost } = usePosts()
  const form = useComposerForm(post)
  const { values, errors, set } = form
  const [submitting, setSubmitting] = useState(false)
  const [previewOnPhone, setPreviewOnPhone] = useState(false)

  const usage = platformUsage(values.content).filter((u) => values.platforms.includes(u.platform))
  const needsMedia = values.platforms.some((p) => PLATFORMS[p].requiresMedia)
  const scheduledIso = localInputsToUtcIso(values)

  useEffect(() => {
    onDirtyChange?.(form.isDirty)
    // Reset on unmount so a closed composer never blocks the next close.
    return () => onDirtyChange?.(false)
  }, [form.isDirty, onDirtyChange])

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    if (submitting) return
    const firstInvalid = form.attempt()
    if (firstInvalid) {
      setPreviewOnPhone(false)
      requestAnimationFrame(() => document.getElementById(FOCUS_TARGET[firstInvalid])?.focus())
      return
    }
    setSubmitting(true)
    try {
      const input = toPostInput(values)
      const saved = post ? await updatePost(post.id, input) : await createPost(input)
      const when = format(new Date(saved.scheduledAt), "EEE, MMM d 'at' h:mm a")
      if (post) {
        toast.success('Changes saved', { description: `Scheduled for ${when}` })
      } else {
        toast.success('Post scheduled', {
          description: when,
          action: onView ? { label: 'View', onClick: () => onView(saved) } : undefined,
        })
      }
      onDone?.(saved)
    } catch (error) {
      toast.error(post ? 'Couldn’t save changes' : 'Couldn’t schedule the post', {
        description: error instanceof Error ? error.message : undefined,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault()
      void submit()
    }
  }

  return (
    <form noValidate onSubmit={submit} onKeyDown={onKeyDown} className="flex min-h-0 flex-1 flex-col">
      <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
        <div
          className={cn(
            'min-h-0 space-y-7 overflow-y-auto overscroll-contain px-5 pt-5 pb-8 sm:px-7',
            previewOnPhone && 'max-md:hidden',
          )}
        >
          <Field id="composer-platforms-field" group label="Publish to" error={errors.platforms}>
            <PlatformChips
              selected={values.platforms}
              onChange={(next) => set('platforms', next)}
              invalid={Boolean(errors.platforms)}
              describedBy={describedBy('composer-platforms-field', errors.platforms)}
            />
          </Field>

          <Field
            id="composer-content-field"
            label="Post"
            htmlFor="composer-content"
            error={errors.content}
          >
            <div
              className={cn(
                'rounded-xl border bg-surface transition-[border-color,box-shadow] duration-150',
                'focus-within:border-focus focus-within:ring-3 focus-within:ring-focus/12',
                errors.content || errors.mediaUrl ? 'border-failed-dot' : 'border-line-strong',
              )}
            >
              <textarea
                id="composer-content"
                rows={7}
                placeholder="What’s happening at the shop?"
                value={values.content}
                onChange={(e) => set('content', e.target.value)}
                aria-invalid={Boolean(errors.content) || undefined}
                aria-describedby={describedBy('composer-content-field', errors.content)}
                className="block min-h-[176px] w-full resize-none rounded-t-xl bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed text-ink outline-none placeholder:text-ink-3"
              />
              {values.mediaUrl.trim() && (
                <div className="px-4 pt-1 pb-3">
                  <MediaAttachment
                    url={values.mediaUrl.trim()}
                    onRemove={() => set('mediaUrl', '')}
                    onBrokenChange={form.setMediaBroken}
                  />
                </div>
              )}
              <div className="flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line px-3 py-1.5">
                <div className="flex items-center gap-2">
                  <MediaPicker
                    value={values.mediaUrl}
                    onChange={(url) => set('mediaUrl', url)}
                    invalid={Boolean(errors.mediaUrl)}
                    describedBy={errors.mediaUrl ? 'composer-media-error' : undefined}
                  />
                  {needsMedia && !values.mediaUrl && (
                    <span className="text-[12px] text-ink-3">Required for {values.platforms.filter((p) => PLATFORMS[p].requiresMedia).map((p) => PLATFORMS[p].label).join(' & ')}</span>
                  )}
                </div>
                <LimitMeters usage={usage} />
              </div>
            </div>
            {errors.mediaUrl && (
              <p id="composer-media-error" className="mt-2 flex items-start gap-1.5 text-[12.5px] leading-snug text-failed-ink">
                <CircleAlert aria-hidden className="mt-px size-3.5 shrink-0" strokeWidth={2} />
                {errors.mediaUrl}
              </p>
            )}
          </Field>

          <Field
            id="composer-schedule-field"
            group
            label="When"
            error={errors.schedule}
            hint={<ScheduleSummary date={values.date} time={values.time} />}
          >
            <SchedulePicker
              date={values.date}
              time={values.time}
              onChange={(next) => {
                set('date', next.date)
                set('time', next.time)
              }}
              invalid={Boolean(errors.schedule)}
              describedBy={describedBy('composer-schedule-field', errors.schedule)}
            />
          </Field>
        </div>

        <aside
          aria-label="Preview"
          className={cn(
            'min-h-0 overflow-y-auto overscroll-contain border-line bg-sunken/70 px-5 pt-5 pb-8 md:border-l',
            !previewOnPhone && 'max-md:hidden',
          )}
        >
          <p className="mb-3 text-[11px] font-medium tracking-[0.08em] text-ink-3 uppercase">Preview</p>
          <PostPreview
            content={values.content}
            platforms={values.platforms}
            mediaUrl={values.mediaUrl}
            scheduledAt={scheduledIso}
          />
        </aside>
      </div>

      <footer className="flex items-center gap-2 border-t border-line bg-surface px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-7">
        <Button
          variant="secondary"
          className="md:hidden"
          onClick={() => setPreviewOnPhone((v) => !v)}
          aria-pressed={previewOnPhone}
        >
          {previewOnPhone ? <PenLine strokeWidth={1.75} /> : <Eye strokeWidth={1.75} />}
          {previewOnPhone ? 'Write' : 'Preview'}
        </Button>
        <span className="mr-auto hidden items-center gap-1 text-[12px] text-ink-3 md:inline-flex">
          <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd>↵</Kbd>
          <span className="ml-0.5">to {post ? 'save' : 'schedule'}</span>
        </span>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} className="max-md:ml-auto">
            Cancel
          </Button>
        )}
        <Button type="submit" variant="accent" size="lg" disabled={submitting} className="max-md:ml-auto">
          {submitting && <Loader2 className="animate-spin" />}
          {post ? 'Save changes' : 'Schedule post'}
        </Button>
      </footer>
    </form>
  )
}
