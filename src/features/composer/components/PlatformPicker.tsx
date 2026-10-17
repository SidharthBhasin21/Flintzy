import { Check } from 'lucide-react'
import { PLATFORMS, PLATFORM_ORDER } from '@/lib/constants'
import { cn, formatNumber } from '@/lib/utils'
import { PlatformIcon } from '@/components/platform/PlatformIcon'
import type { Platform } from '@/features/posts/types'
import type { PlatformUsage } from '../utils/validation'

/**
 * Platform toggles that double as live character meters, so the limit for
 * each network is visible right where it's chosen.
 */
export function PlatformPicker({
  selected,
  usage,
  onChange,
  invalid,
  describedBy,
}: {
  selected: Platform[]
  usage: PlatformUsage[]
  onChange: (next: Platform[]) => void
  invalid?: boolean
  describedBy?: string
}) {
  const toggle = (p: Platform) =>
    onChange(selected.includes(p) ? selected.filter((s) => s !== p) : [...selected, p])

  return (
    <div className="grid grid-cols-2 gap-2 min-[400px]:grid-cols-4" aria-describedby={describedBy}>
      {PLATFORM_ORDER.map((p, index) => {
        const on = selected.includes(p)
        const u = usage.find((x) => x.platform === p)!
        const ratio = Math.min(u.count / u.limit, 1)
        return (
          <button
            key={p}
            id={index === 0 ? 'composer-platforms' : undefined}
            type="button"
            aria-pressed={on}
            aria-label={`${PLATFORMS[p].label}, ${formatNumber(u.count)} of ${formatNumber(u.limit)} characters`}
            onClick={() => toggle(p)}
            className={cn(
              'group relative flex flex-col gap-2.5 rounded-lg border bg-surface px-2.5 pt-2.5 pb-2 text-left transition-[border-color,box-shadow,background-color] duration-150',
              on
                ? 'border-ink shadow-[0_0_0_0.5px_var(--ink)]'
                : 'border-line-strong hover:border-ink-3/70 hover:bg-hover/50',
              invalid && !on && 'border-failed-dot/50',
            )}
          >
            <span className="flex items-center justify-between">
              <PlatformIcon
                decorative
                platform={p}
                className={cn('size-[18px] transition-opacity', !on && 'opacity-55 group-hover:opacity-80')}
              />
              <span
                aria-hidden
                className={cn(
                  'inline-flex size-4 items-center justify-center rounded-full border transition-colors',
                  on ? 'border-primary bg-primary text-primary-ink' : 'border-line-strong',
                )}
              >
                {on && <Check className="size-2.5" strokeWidth={3.5} />}
              </span>
            </span>
            <span>
              <span className={cn('block text-[13px] font-medium', on ? 'text-ink' : 'text-ink-2')}>
                {PLATFORMS[p].label}
              </span>
              <span
                className={cn(
                  'mt-0.5 block font-mono text-[11px] tabular-nums',
                  on && u.over ? 'text-failed-ink' : on && u.near ? 'text-warn-ink' : 'text-ink-3',
                )}
              >
                {formatNumber(u.count)}/{formatNumber(u.limit)}
              </span>
            </span>
            <span aria-hidden className="h-[3px] overflow-hidden rounded-full bg-selected">
              <span
                className={cn(
                  'block h-full origin-left rounded-full transition-[transform,background-color] duration-300 ease-out-quint',
                  !on ? 'bg-ink-3/40' : u.over ? 'bg-failed-dot' : u.near ? 'bg-warn-bar' : 'bg-ink-2',
                )}
                style={{ transform: `scaleX(${ratio})` }}
              />
            </span>
          </button>
        )
      })}
    </div>
  )
}
