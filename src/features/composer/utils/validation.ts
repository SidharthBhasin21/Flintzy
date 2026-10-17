import { addMinutes } from 'date-fns'
import { MIN_LEAD_MINUTES, PLATFORMS, PLATFORM_ORDER } from '@/lib/constants'
import { localInputsToUtcIso } from '@/lib/dates'
import { countCharacters } from '@/lib/utils'
import type { Platform, PostInput } from '@/features/posts/types'

export interface ComposerValues {
  content: string
  platforms: Platform[]
  mediaUrl: string
  date: string
  time: string
}

export type ComposerField = 'content' | 'platforms' | 'mediaUrl' | 'schedule'
export type ComposerErrors = Partial<Record<ComposerField, string>>

export interface PlatformUsage {
  platform: Platform
  count: number
  limit: number
  over: boolean
  /** True once the caption uses 90% of the limit. */
  near: boolean
}

const listFormat = (items: string[]) =>
  new Intl.ListFormat(undefined, { type: 'conjunction' }).format(items)

export function platformUsage(content: string): PlatformUsage[] {
  const count = countCharacters(content)
  return PLATFORM_ORDER.map((platform) => {
    const limit = PLATFORMS[platform].charLimit
    return { platform, count, limit, over: count > limit, near: count >= limit * 0.9 }
  })
}

export function isValidMediaUrl(value: string) {
  if (value.startsWith('/')) return true // bundled sample media
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

export function validate(values: ComposerValues, now: Date, mediaBroken: boolean): ComposerErrors {
  const errors: ComposerErrors = {}
  const content = values.content.trim()

  if (!content) {
    errors.content = 'Write something to post.'
  } else {
    const over = platformUsage(values.content).filter(
      (u) => u.over && values.platforms.includes(u.platform),
    )
    if (over.length) {
      const smallest = Math.min(...over.map((u) => u.limit))
      errors.content = `Too long for ${listFormat(over.map((u) => PLATFORMS[u.platform].label))}. Trim it to ${smallest.toLocaleString()} characters.`
    }
  }

  if (!values.platforms.length) errors.platforms = 'Choose at least one platform.'

  const mediaUrl = values.mediaUrl.trim()
  const needsMedia = values.platforms.filter((p) => PLATFORMS[p].requiresMedia)
  if (mediaUrl && !isValidMediaUrl(mediaUrl)) {
    errors.mediaUrl = 'Enter a full image URL, starting with https://'
  } else if (mediaUrl && mediaBroken) {
    errors.mediaUrl = 'That image couldn’t be loaded. Check the URL or pick one from the library.'
  } else if (!mediaUrl && needsMedia.length) {
    errors.mediaUrl = `${listFormat(needsMedia.map((p) => PLATFORMS[p].label))} ${needsMedia.length > 1 ? 'need' : 'needs'} an image.`
  }

  const iso = localInputsToUtcIso(values)
  if (!values.date || !values.time) {
    errors.schedule = 'Pick a date and time.'
  } else if (!iso) {
    errors.schedule = 'That date or time isn’t valid.'
  } else if (new Date(iso) < addMinutes(now, MIN_LEAD_MINUTES)) {
    errors.schedule = `Pick a time at least ${MIN_LEAD_MINUTES} minutes from now.`
  }

  return errors
}

export function toPostInput(values: ComposerValues): PostInput {
  const iso = localInputsToUtcIso(values)
  if (!iso) throw new Error('Invalid schedule')
  const mediaUrl = values.mediaUrl.trim()
  return {
    content: values.content.trim(),
    // Persist in canonical order regardless of click order.
    platforms: PLATFORM_ORDER.filter((p) => values.platforms.includes(p)),
    mediaUrl: mediaUrl || undefined,
    scheduledAt: iso,
  }
}
