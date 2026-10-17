import { startOfDay } from 'date-fns'
import { dayKey, parseDayKey } from '@/lib/dates'
import type { Post } from '../types'

export interface DayGroup {
  key: string
  date: Date
  posts: Post[]
}

const byTime = (a: Post, b: Post) => Date.parse(a.scheduledAt) - Date.parse(b.scheduledAt)

export function groupByDay(posts: Post[]): DayGroup[] {
  const groups = new Map<string, Post[]>()
  for (const post of [...posts].sort(byTime)) {
    const key = dayKey(new Date(post.scheduledAt))
    const list = groups.get(key)
    if (list) list.push(post)
    else groups.set(key, [post])
  }
  return [...groups].map(([key, list]) => ({ key, date: parseDayKey(key), posts: list }))
}

/**
 * Queue ordering: today and the days ahead first (soonest at the top), then
 * earlier days, most recent first. Within a day posts are always chronological.
 */
export function splitQueue(posts: Post[], now: Date) {
  const today = startOfDay(now).getTime()
  const groups = groupByDay(posts)
  return {
    upcoming: groups.filter((g) => g.date.getTime() >= today),
    past: groups.filter((g) => g.date.getTime() < today).reverse(),
  }
}
