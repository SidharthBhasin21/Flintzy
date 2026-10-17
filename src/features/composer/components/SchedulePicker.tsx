import { CalendarDays, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { Input } from '@/components/ui/input'
import { formatUtc, localInputsToUtcIso, localTimeZone, quickSlots, zoneAbbreviation } from '@/lib/dates'
import { cn } from '@/lib/utils'

export function SchedulePicker({
  date,
  time,
  onChange,
  invalid,
  describedBy,
}: {
  date: string
  time: string
  onChange: (next: { date: string; time: string }) => void
  invalid?: boolean
  describedBy?: string
}) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const slots = quickSlots()

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Quick picks">
        {slots.map((slot) => {
          const active = slot.date === date && slot.time === time
          return (
            <button
              key={slot.label}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ date: slot.date, time: slot.time })}
              className={cn(
                'h-7 rounded-full border px-3 text-[12.5px] font-medium transition-colors',
                active
                  ? 'border-accent bg-accent-soft text-accent'
                  : 'border-line-strong bg-surface text-ink-2 hover:border-ink-3 hover:text-ink',
              )}
            >
              {slot.label}
            </button>
          )
        })}
      </div>
      <div className="grid grid-cols-[1.3fr_1fr] gap-2 sm:max-w-[360px]">
        <div className="relative">
          <CalendarDays aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-3" strokeWidth={1.75} />
          <Input
            id="composer-date"
            type="date"
            aria-label="Date"
            min={today}
            value={date}
            onChange={(e) => onChange({ date: e.target.value, time })}
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
            onChange={(e) => onChange({ date, time: e.target.value })}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className="h-9 pl-8 tabular-nums"
          />
        </div>
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
      Goes out {format(when, "EEEE, MMM d 'at' h:mm a")} {zoneAbbreviation(when)}
      <span className="text-ink-3/70"> · </span>
      <span className="font-mono text-[11.5px]">{formatUtc(iso, 'HH:mm')} UTC</span>
    </>
  )
}
