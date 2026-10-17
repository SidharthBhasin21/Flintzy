import { useState } from 'react'
import { defaultScheduleInputs, utcIsoToLocalInputs } from '@/lib/dates'
import type { Post } from '@/features/posts/types'
import { validate, type ComposerField, type ComposerValues } from '../utils/validation'

const FIELD_ORDER: ComposerField[] = ['content', 'platforms', 'mediaUrl', 'schedule']

function initialValues(post?: Post): ComposerValues {
  if (!post) return { content: '', platforms: [], mediaUrl: '', ...defaultScheduleInputs() }
  return {
    content: post.content,
    platforms: post.platforms,
    mediaUrl: post.mediaUrl ?? '',
    // A failed post's original slot is in the past, so suggest a fresh one.
    ...(post.status === 'failed' ? defaultScheduleInputs() : utcIsoToLocalInputs(post.scheduledAt)),
  }
}

/**
 * Form state for the composer. Errors stay hidden until the first submit
 * attempt, then update live so people can see each one clear as they fix it.
 */
export function useComposerForm(post?: Post) {
  const [initial] = useState(() => initialValues(post))
  const [values, setValues] = useState(initial)
  const [attempted, setAttempted] = useState(false)
  const [mediaBroken, setMediaBroken] = useState(false)

  const errors = validate(values, new Date(), mediaBroken)
  const visibleErrors = attempted ? errors : {}
  const isValid = Object.keys(errors).length === 0
  const isDirty =
    values.content !== initial.content ||
    values.mediaUrl !== initial.mediaUrl ||
    values.platforms.join() !== initial.platforms.join() ||
    values.date !== initial.date ||
    values.time !== initial.time

  const set = <K extends keyof ComposerValues>(key: K, value: ComposerValues[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (key === 'mediaUrl') setMediaBroken(false)
  }

  /** Marks the form as attempted and returns the first invalid field, if any. */
  const attempt = (): ComposerField | null => {
    setAttempted(true)
    return FIELD_ORDER.find((f) => errors[f]) ?? null
  }

  return {
    values,
    set,
    errors: visibleErrors,
    isValid,
    isDirty,
    attempt,
    setMediaBroken,
  }
}
