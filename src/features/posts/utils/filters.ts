import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
  addDays,
} from 'date-fns'
import { PLATFORM_ORDER, STATUS_ORDER } from '@/lib/constants'
import { parseDayKey } from '@/lib/dates'
import type { Platform, Post, PostStatus } from '../types'

export type DateRange = 'all' | 'today' | 'tomorrow' | 'week' | 'month' | 'custom'

export const DATE_RANGE_LABELS: Record<DateRange, string> = {
  all: 'Any date',
  today: 'Today',
  tomorrow: 'Tomorrow',
  week: 'This week',
  month: 'This month',
  custom: 'Custom range',
}

export interface PostFilters {
  q: string
  platforms: Platform[]
  statuses: PostStatus[]
  range: DateRange
  /** yyyy-MM-dd, local. Only used when range is "custom". */
  from: string
  to: string
}

export const EMPTY_FILTERS: PostFilters = {
  q: '',
  platforms: [],
  statuses: [],
  range: 'all',
  from: '',
  to: '',
}

const FILTER_KEYS = ['q', 'platform', 'status', 'range', 'from', 'to'] as const

function parseList<T extends string>(value: string | null, allowed: readonly T[]): T[] {
  if (!value) return []
  const set = new Set(value.split(','))
  // Preserve canonical order and drop anything unknown from a hand-edited URL.
  return allowed.filter((item) => set.has(item))
}

export function parseFilters(params: URLSearchParams): PostFilters {
  const range = params.get('range') as DateRange | null
  return {
    q: params.get('q') ?? '',
    platforms: parseList(params.get('platform'), PLATFORM_ORDER),
    statuses: parseList(params.get('status'), STATUS_ORDER),
    range: range && range in DATE_RANGE_LABELS ? range : 'all',
    from: params.get('from') ?? '',
    to: params.get('to') ?? '',
  }
}

/** Writes filters into a copy of `base`, leaving unrelated params (open panels etc.) alone. */
export function writeFilters(base: URLSearchParams, filters: PostFilters): URLSearchParams {
  const next = new URLSearchParams(base)
  FILTER_KEYS.forEach((key) => next.delete(key))
  if (filters.q.trim()) next.set('q', filters.q)
  if (filters.platforms.length) next.set('platform', filters.platforms.join(','))
  if (filters.statuses.length) next.set('status', filters.statuses.join(','))
  if (filters.range !== 'all') next.set('range', filters.range)
  if (filters.range === 'custom') {
    if (filters.from) next.set('from', filters.from)
    if (filters.to) next.set('to', filters.to)
  }
  return next
}

export function countActiveFilters(f: PostFilters, { includeQuery = true } = {}): number {
  return (
    (includeQuery && f.q.trim() ? 1 : 0) +
    (f.platforms.length ? 1 : 0) +
    (f.statuses.length ? 1 : 0) +
    (f.range !== 'all' ? 1 : 0)
  )
}

function rangeInterval(f: PostFilters, now: Date): { start: Date; end: Date } | null {
  switch (f.range) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) }
    case 'tomorrow': {
      const t = addDays(now, 1)
      return { start: startOfDay(t), end: endOfDay(t) }
    }
    case 'week':
      return { start: startOfWeek(now), end: endOfWeek(now) }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'custom': {
      if (!f.from && !f.to) return null
      const start = f.from ? startOfDay(parseDayKey(f.from)) : new Date(-8.64e15)
      const end = f.to ? endOfDay(parseDayKey(f.to)) : new Date(8.64e15)
      return start <= end ? { start, end } : { start: end, end: start }
    }
    default:
      return null
  }
}

export function applyFilters(
  posts: Post[],
  f: PostFilters,
  now: Date,
  { ignoreRange = false } = {},
): Post[] {
  const query = f.q.trim().toLocaleLowerCase()
  const interval = ignoreRange ? null : rangeInterval(f, now)
  return posts.filter((post) => {
    if (query && !post.content.toLocaleLowerCase().includes(query)) return false
    if (f.statuses.length && !f.statuses.includes(post.status)) return false
    if (f.platforms.length && !post.platforms.some((p) => f.platforms.includes(p))) return false
    if (interval && !isWithinInterval(new Date(post.scheduledAt), interval)) return false
    return true
  })
}
