import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useState } from 'react'
import { PlatformIcon } from '@/components/platform/PlatformIcon'
import { useHotkey } from '@/components/shared/useHotkey'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { PLATFORMS, STATUS_LABELS } from '@/lib/constants'
import { cn, pluralize } from '@/lib/utils'
import type { Post } from '../types'
import { countActiveFilters, countBy, DATE_RANGE_LABELS, type PostFilters } from '../utils/filters'
import { DateMenu, PlatformMenu, StatusMenu } from './FilterMenus'
import { FilterSheet } from './FilterSheet'

interface FilterBarProps {
  posts: Post[]
  filters: PostFilters
  onChange: (patch: Partial<PostFilters>) => void
  onReplace: (next: PostFilters) => void
  onClear: () => void
  resultCount: number
  /** The calendar handles dates itself, so it hides the date filter. */
  showDateFilter?: boolean
}

export function FilterBar({ posts, filters, onChange, onReplace, onClear, resultCount, showDateFilter = true }: FilterBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const counts = countBy(posts)
  const effective = showDateFilter ? filters : { ...filters, range: 'all' as const }
  const active = countActiveFilters(effective)
  const activeWithoutQuery = countActiveFilters(effective, { includeQuery: false })

  useHotkey('/', () => document.getElementById('post-search')?.focus())

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <SearchField value={filters.q} onChange={(q) => onChange({ q })} />

        <div className="hidden items-center gap-2 md:flex">
          <PlatformMenu value={filters.platforms} counts={counts.platforms} onChange={(platforms) => onChange({ platforms })} />
          <StatusMenu value={filters.statuses} counts={counts.statuses} onChange={(statuses) => onChange({ statuses })} />
          {showDateFilter && <DateMenu filters={filters} onChange={onChange} />}
          {active > 0 && (
            <Button variant="ghost" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>

        <Button
          variant="secondary"
          size="icon"
          aria-label={activeWithoutQuery ? `Filters, ${activeWithoutQuery} active` : 'Filters'}
          onClick={() => setSheetOpen(true)}
          className={cn('relative md:hidden', activeWithoutQuery > 0 && 'border-ink/40')}
        >
          <SlidersHorizontal strokeWidth={1.75} />
          {activeWithoutQuery > 0 && (
            <span className="absolute -top-1.5 -right-1.5 inline-flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-ink tabular-nums">
              {activeWithoutQuery}
            </span>
          )}
        </Button>

        {active > 0 && (
          <p aria-live="polite" className="ml-auto hidden shrink-0 text-[12.5px] text-ink-3 tabular-nums lg:block">
            {pluralize(resultCount, 'result')}
          </p>
        )}
      </div>

      {activeWithoutQuery > 0 && (
        <ActiveChips filters={effective} onChange={onChange} onClear={onClear} />
      )}

      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        posts={posts}
        filters={effective}
        onApply={onReplace}
        showDateFilter={showDateFilter}
      />
    </div>
  )
}

/** Removable summaries of active filters, for small screens where menus are hidden. */
function ActiveChips({
  filters,
  onChange,
  onClear,
}: {
  filters: PostFilters
  onChange: (patch: Partial<PostFilters>) => void
  onClear: () => void
}) {
  const chips = [
    ...filters.platforms.map((p) => ({
      key: p,
      label: PLATFORMS[p].label,
      icon: <PlatformIcon decorative platform={p} className="size-3.5" />,
      remove: () => onChange({ platforms: filters.platforms.filter((x) => x !== p) }),
    })),
    ...filters.statuses.map((s) => ({
      key: s,
      label: STATUS_LABELS[s],
      icon: null,
      remove: () => onChange({ statuses: filters.statuses.filter((x) => x !== s) }),
    })),
    ...(filters.range !== 'all'
      ? [{ key: 'range', label: DATE_RANGE_LABELS[filters.range], icon: null, remove: () => onChange({ range: 'all' }) }]
      : []),
  ]
  return (
    <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 [scrollbar-width:none] md:hidden">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          aria-label={`Remove filter: ${chip.label}`}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface pr-2 pl-2.5 text-[12.5px] text-ink"
        >
          {chip.icon}
          {chip.label}
          <X className="size-3 text-ink-3" strokeWidth={2} />
        </button>
      ))}
      <button type="button" onClick={onClear} className="h-7 shrink-0 px-2 text-[12.5px] font-medium text-ink-2">
        Clear all
      </button>
    </div>
  )
}

/**
 * While focused, the field owns its text so fast typing is never overwritten
 * by a URL update that is still in flight. When blurred it mirrors the URL,
 * so clearing filters elsewhere empties it.
 */
function SearchField({ value, onChange }: { value: string; onChange: (q: string) => void }) {
  const [local, setLocal] = useState<string | null>(null)
  const text = local ?? value
  const update = (next: string) => {
    if (local !== null) setLocal(next)
    onChange(next)
  }

  return (
    <div className="relative w-full md:max-w-[300px]">
      <Search aria-hidden className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-3" strokeWidth={1.75} />
      <Input
        id="post-search"
        type="search"
        placeholder="Search posts"
        aria-label="Search posts"
        value={text}
        onFocus={() => setLocal(value)}
        onBlur={() => setLocal(null)}
        onChange={(e) => update(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && text) {
            e.preventDefault()
            update('')
          }
        }}
        className="h-8 pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden"
      />
      {text ? (
        <button
          type="button"
          aria-label="Clear search"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => update('')}
          className="absolute top-1/2 right-1.5 inline-flex size-5 -translate-y-1/2 items-center justify-center rounded text-ink-3 hover:bg-hover hover:text-ink"
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      ) : (
        <Kbd className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-ink-3 max-md:hidden">/</Kbd>
      )}
    </div>
  )
}
