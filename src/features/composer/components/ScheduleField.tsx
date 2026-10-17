import { CalendarDays, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { formatUtc, localInputsToUtcIso, localTimeZone, zoneAbbreviation } from '@/lib/dates'

export function ScheduleField({
  date,
  time,
  onDateChange,
  onTimeChange,
  invalid,
  describedBy,
}: {
  date: string
  time: string
  onDateChange: (value: string) => void
  onTimeChange: (value: string) => void
  invalid?: boolean
  describedBy?: string
}) {
  const today = format(new Date(), 'yyyy-MM-dd')
  return (
    <div className="grid grid-cols-[1.25fr_1fr] gap-2">
      <div className="relative">
        <CalendarDays aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-3" strokeWidth={1.75} />
        <Input
          id="composer-date"
          type="date"
          aria-label="Date"
          min={today}
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-9 pl-8 tabular-nums"
        />
      </div>
      <div className="relative">
        <Clock aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-3" strokeWidth={1.75} />
        <Input
          type="time"
          aria-label="Time"
          step={300}
          value={time}
          onChange={(e) => onTimeChange(e.target.value)}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="h-9 pl-8 tabular-nums"
        />
      </div>
    </div>
  )
}

/** Plain-language confirmation of when the post goes out, in local time and UTC. */
export function ScheduleSummary({ date, time }: { date: string; time: string }) {
  const iso = localInputsToUtcIso({ date, time })
  if (!iso) return <>Times use your local zone, {localTimeZone()}.</>
  const when = new Date(iso)
  return (
    <>
      Publishes {format(when, "EEE, MMM d 'at' h:mm a")} {zoneAbbreviation(when)}
      <span className="text-ink-3/70"> · </span>
      <span className="font-mono text-[11.5px]">{formatUtc(iso, 'HH:mm')} UTC</span>
    </>
  )
}
