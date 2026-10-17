import { useRef } from 'react'
import { STATUS_LABELS, STATUS_ORDER } from '@/lib/constants'
import { gsap, prefersReducedMotion, useGSAP } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { PostStatus } from '../types'

const TABS: Array<{ id: PostStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  ...STATUS_ORDER.map((s) => ({ id: s, label: STATUS_LABELS[s] })),
]

/** Status filter as tabs; counts reflect every other active filter. */
export function StatusTabs({
  value,
  counts,
  onChange,
}: {
  value: PostStatus[]
  counts: Record<PostStatus, number>
  onChange: (next: PostStatus[]) => void
}) {
  const total = STATUS_ORDER.reduce((n, s) => n + counts[s], 0)
  const active = value.length === 0 ? 'all' : value.length === 1 ? value[0] : null
  const ref = useRef<HTMLDivElement>(null)
  const placed = useRef(false)

  // One underline that slides to the selected tab (scaleX on a fixed-width bar,
  // so only transforms animate).
  useGSAP(
    () => {
      const bar = ref.current?.querySelector<HTMLElement>('[data-indicator]')
      if (!bar) return
      const place = (animate: boolean) => {
        const tab = ref.current?.querySelector<HTMLElement>('[aria-pressed="true"]')
        const to = tab
          ? { x: tab.offsetLeft, scaleX: tab.offsetWidth / 100, autoAlpha: 1 }
          : { autoAlpha: 0 }
        if (animate && !prefersReducedMotion()) gsap.to(bar, { ...to, duration: 0.35, ease: 'power3.inOut' })
        else gsap.set(bar, to)
      }
      place(placed.current)
      placed.current = true
      // Re-measure once web fonts have settled widths.
      void document.fonts?.ready.then(() => place(false))
    },
    { scope: ref, dependencies: [active, total] },
  )

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Filter by status"
      className="relative -mx-4 flex gap-5 overflow-x-auto border-b border-line px-4 [scrollbar-width:none] sm:mx-0 sm:px-0"
    >
      <span
        data-indicator
        aria-hidden
        className="invisible absolute bottom-0 left-0 h-[2px] w-[100px] origin-left rounded-full bg-ink"
      />
      {TABS.map((tab) => {
        const selected = tab.id === active
        const count = tab.id === 'all' ? total : counts[tab.id]
        return (
          <button
            key={tab.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(tab.id === 'all' ? [] : [tab.id])}
            className={cn(
              'inline-flex h-10 shrink-0 items-center gap-1.5 text-[13.5px] font-medium transition-colors',
              selected ? 'text-ink' : 'text-ink-3 hover:text-ink-2',
            )}
          >
            {tab.label}
            <span
              className={cn(
                'rounded-full px-1.5 py-px text-[11px] tabular-nums',
                selected ? 'bg-primary text-primary-ink' : 'bg-selected text-ink-2',
                tab.id === 'failed' && count > 0 && !selected && 'bg-failed-bg text-failed-ink',
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
