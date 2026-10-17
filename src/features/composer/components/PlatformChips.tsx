import { Check } from 'lucide-react'
import { PlatformIcon } from '@/components/platform/PlatformIcon'
import { PLATFORMS, PLATFORM_ORDER } from '@/lib/constants'
import { cn } from '@/lib/utils'
import type { Platform } from '@/features/posts/types'

export function PlatformChips({
  selected,
  onChange,
  invalid,
  describedBy,
}: {
  selected: Platform[]
  onChange: (next: Platform[]) => void
  invalid?: boolean
  describedBy?: string
}) {
  const toggle = (p: Platform) =>
    onChange(selected.includes(p) ? selected.filter((s) => s !== p) : [...selected, p])

  return (
    <div className="flex flex-wrap gap-2" aria-describedby={describedBy}>
      {PLATFORM_ORDER.map((p, index) => {
        const on = selected.includes(p)
        return (
          <button
            key={p}
            id={index === 0 ? 'composer-platforms' : undefined}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(p)}
            className={cn(
              'inline-flex h-9 items-center gap-2 rounded-lg border pr-3 pl-2.5 text-[13px] font-medium transition-[background-color,border-color,color] duration-150',
              on
                ? 'border-primary bg-primary text-primary-ink'
                : 'border-line-strong bg-surface text-ink-2 hover:border-ink-3 hover:text-ink',
              invalid && !on && 'border-failed-dot/60',
            )}
          >
            <PlatformIcon decorative platform={p} tone={on ? 'mono' : 'brand'} />
            {PLATFORMS[p].label}
            {on && <Check aria-hidden className="-mr-0.5 size-3.5 opacity-80" strokeWidth={2.5} />}
          </button>
        )
      })}
    </div>
  )
}
