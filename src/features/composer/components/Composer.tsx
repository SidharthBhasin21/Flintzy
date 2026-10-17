import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react'
import { format } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PLATFORMS } from '@/lib/constants'
import { localInputsToUtcIso } from '@/lib/dates'
import { cn, formatNumber } from '@/lib/utils'
import { usePosts } from '@/features/posts/store/context'
import type { Post } from '@/features/posts/types'
import { useComposerForm } from '../hooks/useComposerForm'
import { platformUsage, toPostInput, type ComposerField } from '../utils/validation'
import { Field } from './Field'
import { MediaField } from './MediaField'
import { PlatformPicker } from './PlatformPicker'
import { PostPreview } from './PostPreview'
import { ScheduleField, ScheduleSummary } from './ScheduleField'

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

export function Composer({ post, onDone, onCancel, onDirtyChange, onView }: ComposerProps) {
  const { createPost, updatePost } = usePosts()
  const form = useComposerForm(post)
  const { values, errors, set } = form
  const [tab, setTab] = useState('content')
  const [submitting, setSubmitting] = useState(false)

  const usage = platformUsage(values.content)
  const selectedUsage = usage.filter((u) => values.platforms.includes(u.platform))
  const strictest = selectedUsage.reduce<(typeof usage)[number] | null>(
    (min, u) => (!min || u.limit < min.limit ? u : min),
    null,
  )
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
      setTab('content')
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
        form.reset()
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
      <Tabs value={tab} onValueChange={setTab} className="flex min-h-0 flex-1 flex-col">
        <div className="px-5">
          <TabsList className="w-full">
            <TabsTrigger value="content" className="flex-1">
              Content
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex-1">
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-6">
          <TabsContent value="content" className="space-y-6 outline-none">
            <Field
              id="composer-content-field"
              label="Post"
              htmlFor="composer-content"
              error={errors.content}
            >
              <div className="relative">
                <Textarea
                  id="composer-content"
                  rows={6}
                  placeholder="What do you want to share?"
                  value={values.content}
                  onChange={(e) => set('content', e.target.value)}
                  aria-invalid={Boolean(errors.content) || undefined}
                  aria-describedby={describedBy('composer-content-field', errors.content)}
                  className="min-h-[148px] pb-8"
                />
                <span
                  aria-live="polite"
                  className={cn(
                    'pointer-events-none absolute right-3 bottom-2.5 font-mono text-[11px] tabular-nums',
                    strictest?.over ? 'text-failed-ink' : strictest?.near ? 'text-warn-ink' : 'text-ink-3',
                  )}
                >
                  {strictest
                    ? strictest.over
                      ? `${formatNumber(strictest.count - strictest.limit)} over for ${PLATFORMS[strictest.platform].label}`
                      : `${formatNumber(strictest.limit - strictest.count)} left`
                    : formatNumber(usage[0].count)}
                </span>
              </div>
            </Field>

            <Field
              id="composer-platforms-field"
              group
              label="Platforms"
              aside={values.platforms.length ? `${values.platforms.length} selected` : undefined}
              error={errors.platforms}
            >
              <PlatformPicker
                selected={values.platforms}
                usage={usage}
                onChange={(next) => set('platforms', next)}
                invalid={Boolean(errors.platforms)}
                describedBy={describedBy('composer-platforms-field', errors.platforms)}
              />
            </Field>

            <Field
              id="composer-media-field"
              label="Image"
              htmlFor="composer-media"
              aside={
                values.platforms.some((p) => PLATFORMS[p].requiresMedia) ? 'Required' : 'Optional'
              }
              error={errors.mediaUrl}
            >
              <MediaField
                value={values.mediaUrl}
                onChange={(url) => set('mediaUrl', url)}
                onBrokenChange={form.setMediaBroken}
                invalid={Boolean(errors.mediaUrl)}
                describedBy={describedBy('composer-media-field', errors.mediaUrl)}
              />
            </Field>

            <Field
              id="composer-schedule-field"
              group
              label="Schedule"
              error={errors.schedule}
              hint={<ScheduleSummary date={values.date} time={values.time} />}
            >
              <ScheduleField
                date={values.date}
                time={values.time}
                onDateChange={(v) => set('date', v)}
                onTimeChange={(v) => set('time', v)}
                invalid={Boolean(errors.schedule)}
                describedBy={describedBy('composer-schedule-field', errors.schedule)}
              />
            </Field>
          </TabsContent>

          <TabsContent value="preview" className="outline-none">
            <PostPreview
              content={values.content}
              platforms={values.platforms}
              mediaUrl={values.mediaUrl}
              scheduledAt={scheduledIso}
            />
          </TabsContent>
        </div>
      </Tabs>

      <footer className="flex items-center gap-2 border-t border-line bg-surface px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <span className="mr-auto hidden items-center gap-1 text-[12px] text-ink-3 sm:inline-flex">
          <Kbd>{isMac ? '⌘' : 'Ctrl'}</Kbd>
          <Kbd>↵</Kbd>
          <span className="ml-0.5">to {post ? 'save' : 'schedule'}</span>
        </span>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} className="max-sm:mr-auto">
            Cancel
          </Button>
        )}
        <Button type="submit" variant="primary" size="lg" disabled={submitting} className="max-sm:flex-1">
          {submitting && <Loader2 className="animate-spin" />}
          {post ? 'Save changes' : 'Schedule post'}
        </Button>
      </footer>
    </form>
  )
}
