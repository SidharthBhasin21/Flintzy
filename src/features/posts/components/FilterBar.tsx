import { Search, X } from 'lucide-react'
import { useState } from 'react'
import { PlatformIcon } from '@/components/platform/PlatformIcon'
import { useHotkey } from '@/components/shared/useHotkey'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Kbd } from '@/components/ui/kbd'
import { PLATFORMS, PLATFORM_ORDER } from '@/lib/constants'
import { cn, pluralize } from '@/lib/utils'
import { useNow } from '../hooks/useNow'
import type { Platform, Post } from '../types'
import { applyFilters, countActiveFilters, countBy, type PostFilters } from '../utils/filters'
import { DateMenu } from './FilterMenus'
import { StatusTabs } from './StatusTabs'

interface FilterBarProps {
  posts: Post[]
  filters: PostFilters
  onChange: (patch: Partial<PostFilters>) => void
  onClear: () => void
  resultCount: number
  /** The calendar handles dates itself, so it hides the date filter. */
  showDateFilter?: boolean
}

export function FilterBar({ posts, filters, onChange, onClear, resultCount, showDateFilter = true }: FilterBarProps) {
  const now = useNow()
  const effective = showDateFilter ? filters : { ...filters, range: 'all' as const }
  const active = countActiveFilters(effective)
  // Tab counts reflect everything except the status filter itself.
  const statusCounts = countBy(
    applyFilters(posts, { ...effective, statuses: [] }, now, { ignoreRange: !showDateFilter }),
  ).statuses

  useHotkey('/', () => document.getElementById('post-search')?.focus())

  return (
    <div className="space-y-4">
      <StatusTabs value={filters.statuses} counts={statusCounts} onChange={(statuses) => onChange({ statuses })} />

      <div className="flex flex-wrap items-center gap-2">
        <SearchField value={filters.q} onChange={(q) => onChange({ q })} />
        <PlatformToggles value={filters.platforms} onChange={(platforms) => onChange({ platforms })} />
        {showDateFilter && <DateMenu filters={filters} onChange={onChange} />}
        {active > 0 && (
          <>
            <Button variant="ghost" onClick={onClear}>
              Clear
            </Button>
            <p aria-live="polite" className="ml-auto text-[12.5px] text-ink-3 tabular-nums max-sm:hidden">
              {pluralize(resultCount, 'result')}
            </p>
          </>
        )}
      </div>
    </div>
  )
}

/** Four icon toggles; any combination may be on. */
function PlatformToggles({ value, onChange }: { value: Platform[]; onChange: (next: Platform[]) => void }) {
  return (
    <div role="group" aria-label="Filter by platform" className="inline-flex h-8 items-center rounded-md border border-line-strong bg-surface p-0.5">
      {PLATFORM_ORDER.map((p) => {
        const on = value.includes(p)
        return (
          <button
            key={p}
            type="button"
            aria-pressed={on}
            title={on ? `Showing ${PLATFORMS[p].label}` : `Only ${PLATFORMS[p].label}`}
            onClick={() => onChange(on ? value.filter((x) => x !== p) : [...value, p])}
            className={cn(
              'inline-flex h-[26px] w-8 items-center justify-center rounded-[5px] transition-[background-color,opacity]',
              on ? 'bg-selected' : value.length ? 'opacity-45 hover:opacity-80' : 'hover:bg-hover',
            )}
          >
            <PlatformIcon platform={p} className="size-[15px]" />
          </button>
        )
      })}
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
    <div className="relative w-full sm:w-[260px]">
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
