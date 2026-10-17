import { PlatformIcon } from '@/components/platform/PlatformIcon'
import { PLATFORMS } from '@/lib/constants'
import { cn, formatNumber } from '@/lib/utils'
import type { PlatformUsage } from '../utils/validation'

const R = 7
const C = 2 * Math.PI * R

/** Ring meters for each selected platform; the count only appears once it matters. */
export function LimitMeters({ usage }: { usage: PlatformUsage[] }) {
  if (!usage.length) {
    return <span className="text-[12px] text-ink-3">Pick a platform to see its limit</span>
  }
  return (
    <ul className="flex items-center gap-3" aria-label="Character limits">
      {usage.map((u) => {
        const remaining = u.limit - u.count
        const ratio = Math.min(u.count / u.limit, 1)
        const tone = u.over ? 'text-failed-dot' : u.near ? 'text-warn-bar' : 'text-ink-2'
        return (
          <li
            key={u.platform}
            className="flex items-center gap-1.5"
            title={`${PLATFORMS[u.platform].label}: ${formatNumber(u.count)} of ${formatNumber(u.limit)} characters`}
          >
            <PlatformIcon decorative platform={u.platform} tone="mono" className="size-3 text-ink-3" />
            <svg viewBox="0 0 18 18" className="size-[18px] -rotate-90" aria-hidden>
              <circle cx="9" cy="9" r={R} fill="none" strokeWidth="2" className="stroke-selected" />
              <circle
                cx="9"
                cy="9"
                r={R}
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                stroke="currentColor"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - ratio)}
                className={cn('transition-[stroke-dashoffset] duration-300 ease-out-quint', tone)}
              />
            </svg>
            <span
              className={cn(
                'font-mono text-[11.5px] tabular-nums',
                u.over ? 'text-failed-ink' : u.near ? 'text-warn-ink' : 'text-ink-3',
              )}
            >
              {u.over ? `−${formatNumber(-remaining)}` : formatNumber(remaining)}
            </span>
            <span className="sr-only">
              {PLATFORMS[u.platform].label}: {u.over ? `${formatNumber(-remaining)} over the limit` : `${formatNumber(remaining)} left`}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
