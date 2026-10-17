import { useState, type ReactNode } from 'react'
import { PlatformIcon } from '@/components/platform/PlatformIcon'
import { StatusDot } from '@/components/posts/StatusBadge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DialogDescription, DialogTitle, SheetCloseButton } from '@/components/ui/dialog'
import { PLATFORMS, PLATFORM_ORDER, STATUS_LABELS, STATUS_ORDER } from '@/lib/constants'
import { pluralize } from '@/lib/utils'
import { useNow } from '../hooks/useNow'
import type { Post } from '../types'
import { applyFilters, EMPTY_FILTERS, type PostFilters } from '../utils/filters'
import { DateRangeOptions } from './FilterMenus'

/** Loaded on demand the first time the sheet opens. */
export default function SheetBody({
  posts,
  initial,
  showDateFilter,
  onApply,
}: {
  posts: Post[]
  initial: PostFilters
  showDateFilter: boolean
  onApply: (next: PostFilters) => void
}) {
  const now = useNow()
  const [draft, setDraft] = useState(initial)
  const patch = (p: Partial<PostFilters>) => setDraft((d) => ({ ...d, ...p }))
  const results = applyFilters(posts, draft, now, { ignoreRange: !showDateFilter }).length

  return (
    <>
      <div aria-hidden className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-line-strong" />
      <header className="flex h-12 shrink-0 items-center justify-between pr-2 pl-5">
        <DialogTitle className="text-[15px] font-semibold tracking-tight">Filters</DialogTitle>
        <DialogDescription className="sr-only">Filter posts by platform, status and date.</DialogDescription>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setDraft({ ...EMPTY_FILTERS, q: draft.q })}>
            Reset
          </Button>
          <SheetCloseButton />
        </div>
      </header>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 pt-2 pb-5">
        <FilterGroup title="Platforms">
          {PLATFORM_ORDER.map((p) => (
            <CheckRow
              key={p}
              id={`sheet-platform-${p}`}
              checked={draft.platforms.includes(p)}
              onChange={(on) =>
                patch({ platforms: on ? [...draft.platforms, p] : draft.platforms.filter((x) => x !== p) })
              }
            >
              <PlatformIcon decorative platform={p} />
              {PLATFORMS[p].label}
            </CheckRow>
          ))}
        </FilterGroup>

        <FilterGroup title="Status">
          {STATUS_ORDER.map((s) => (
            <CheckRow
              key={s}
              id={`sheet-status-${s}`}
              checked={draft.statuses.includes(s)}
              onChange={(on) =>
                patch({ statuses: on ? [...draft.statuses, s] : draft.statuses.filter((x) => x !== s) })
              }
            >
              <span className="inline-flex size-4 items-center justify-center">
                <StatusDot status={s} className="size-2" />
              </span>
              {STATUS_LABELS[s]}
            </CheckRow>
          ))}
        </FilterGroup>

        {showDateFilter && (
          <FilterGroup title="Date">
            <div className="-mx-2">
              <DateRangeOptions filters={draft} onChange={patch} idPrefix="sheet-date" />
            </div>
          </FilterGroup>
        )}
      </div>

      <footer className="shrink-0 border-t border-line px-5 py-3">
        <Button variant="primary" size="lg" className="w-full" onClick={() => onApply(draft)}>
          {results === 0 ? 'No matching posts' : `Show ${pluralize(results, 'post')}`}
        </Button>
      </footer>
    </>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-1.5 text-[12px] font-medium tracking-wide text-ink-3 uppercase">{title}</h3>
      <div>{children}</div>
    </section>
  )
}

function CheckRow({
  id,
  checked,
  onChange,
  children,
}: {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  children: ReactNode
}) {
  return (
    <label htmlFor={id} className="flex h-11 cursor-pointer items-center gap-3 text-[14px] text-ink">
      <span className="flex flex-1 items-center gap-3">{children}</span>
      <Checkbox id={id} checked={checked} onCheckedChange={(v) => onChange(v === true)} />
    </label>
  )
}
