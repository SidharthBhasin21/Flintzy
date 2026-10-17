import {
  addDays,
  addMinutes,
  differenceInCalendarDays,
  differenceInMinutes,
  format,
  isValid,
  parse,
  setHours,
  startOfDay,
} from 'date-fns'
import { tz } from '@date-fns/tz'

/*
 * Time rules for the whole app:
 * - Posts store `scheduledAt` as a UTC ISO string.
 * - Everything shown to the user is in the browser's local zone.
 * - Form inputs collect a local wall-clock date + time and are converted
 *   to UTC exactly once, in `localInputsToUtcIso`.
 */

export const localTimeZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone

/** Short zone label for a given instant, e.g. "IST", "BST" or "GMT+2". DST-aware. */
export function zoneAbbreviation(date: Date = new Date()): string {
  const part = new Intl.DateTimeFormat(undefined, { timeZoneName: 'short' })
    .formatToParts(date)
    .find((p) => p.type === 'timeZoneName')
  return part?.value ?? localTimeZone()
}

export const dayKey = (date: Date) => format(date, 'yyyy-MM-dd')

export const parseDayKey = (key: string) => parse(key, 'yyyy-MM-dd', new Date())

export const formatTime = (iso: string) => format(new Date(iso), 'h:mm a')

export const formatUtc = (iso: string, pattern = 'MMM d, yyyy, h:mm a') =>
  format(new Date(iso), pattern, { in: tz('UTC') })

export const formatLocal = (iso: string, pattern = 'MMM d, yyyy, h:mm a') =>
  format(new Date(iso), pattern)

/** "Today", "Tomorrow", "Yesterday", else weekday + date. */
export function dayLabel(date: Date, now: Date): string {
  const diff = differenceInCalendarDays(date, now)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff === -1) return 'Yesterday'
  return format(date, 'EEE, MMM d')
}

/** Compact distance from now: "in 2h 15m", "in 3 days", "45m ago", "yesterday". */
export function relativeTime(iso: string, now: Date): string {
  const date = new Date(iso)
  const minutes = differenceInMinutes(date, now)
  const abs = Math.abs(minutes)
  const days = differenceInCalendarDays(date, now)

  if (abs < 1) return 'now'
  if (abs < 60) return minutes > 0 ? `in ${abs}m` : `${abs}m ago`
  if (Math.abs(days) === 0 || abs < 6 * 60) {
    const h = Math.floor(abs / 60)
    const m = abs % 60
    // Minutes only matter while the post is close.
    const span = m && h < 6 ? `${h}h ${m}m` : `${h}h`
    return minutes > 0 ? `in ${span}` : `${span} ago`
  }
  if (days === 1) return 'tomorrow'
  if (days === -1) return 'yesterday'
  return days > 0 ? `in ${days} days` : `${-days} days ago`
}

export interface LocalDateTimeInputs {
  date: string // yyyy-MM-dd
  time: string // HH:mm
}

export function utcIsoToLocalInputs(iso: string): LocalDateTimeInputs {
  const d = new Date(iso)
  return { date: format(d, 'yyyy-MM-dd'), time: format(d, 'HH:mm') }
}

/** Interprets the inputs as local wall-clock time and returns a UTC ISO string. */
export function localInputsToUtcIso({ date, time }: LocalDateTimeInputs): string | null {
  if (!date || !time) return null
  const parsed = parse(`${date} ${time}`, 'yyyy-MM-dd HH:mm', new Date())
  return isValid(parsed) ? parsed.toISOString() : null
}

/**
 * A sensible default slot: the next half hour at least an hour from now,
 * unless that lands outside 8:00–21:00, in which case 9:00 the next morning.
 */
export function defaultScheduleInputs(now = new Date()): LocalDateTimeInputs {
  const target = addMinutes(now, 60)
  let slot = new Date(target)
  slot.setSeconds(0, 0)
  slot.setMinutes(target.getMinutes() < 30 ? 30 : 60)
  if (slot.getHours() < 8 || slot.getHours() >= 21) {
    slot = setHours(startOfDay(slot.getHours() < 8 ? slot : addDays(slot, 1)), 9)
  }
  return { date: format(slot, 'yyyy-MM-dd'), time: format(slot, 'HH:mm') }
}

export interface QuickSlot extends LocalDateTimeInputs {
  label: string
}

/** One-tap scheduling suggestions, all in local time. */
export function quickSlots(now = new Date()): QuickSlot[] {
  const inAnHour = addMinutes(now, 60)
  inAnHour.setSeconds(0, 0)
  inAnHour.setMinutes(Math.ceil(inAnHour.getMinutes() / 15) * 15)

  const tomorrowMorning = setHours(startOfDay(addDays(now, 1)), 9)
  const daysToMonday = ((8 - now.getDay()) % 7) || 7
  const mondayMorning = setHours(startOfDay(addDays(now, daysToMonday)), 9)

  const toInputs = (d: Date) => ({ date: format(d, 'yyyy-MM-dd'), time: format(d, 'HH:mm') })
  const slots: QuickSlot[] = [
    { label: 'In 1 hour', ...toInputs(inAnHour) },
    { label: 'Tomorrow, 9 AM', ...toInputs(tomorrowMorning) },
  ]
  // Skip Monday when it's tomorrow; it would duplicate the previous chip.
  if (daysToMonday !== 1) slots.push({ label: 'Monday, 9 AM', ...toInputs(mondayMorning) })
  return slots
}
