import { CalendarRange, ChevronDown } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { Radio, RadioGroup } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { DATE_RANGE_LABELS, type DateRange, type PostFilters } from '../utils/filters'

/** Radix passes its handlers, aria state and ref through `asChild`, so spread them onto the button. */
function FilterTrigger({
  active,
  icon: Icon,
  children,
  className,
  ...props
}: ButtonProps & { active: boolean; icon: typeof CalendarRange; children: string }) {
  return (
    <Button
      variant="secondary"
      className={cn(
        'data-[state=open]:bg-hover',
        active && 'border-ink/40 bg-selected/60 hover:bg-selected',
        className,
      )}
      {...props}
    >
      <Icon strokeWidth={1.75} className="text-ink-2" />
      {children}
      <ChevronDown strokeWidth={1.75} className="-mr-0.5 text-ink-3" />
    </Button>
  )
}

export function DateRangeOptions({
  filters,
  onChange,
  idPrefix,
}: {
  filters: Pick<PostFilters, 'range' | 'from' | 'to'>
  onChange: (patch: Partial<PostFilters>) => void
  idPrefix: string
}) {
  return (
    <div>
      <RadioGroup
        value={filters.range}
        onValueChange={(range) => onChange({ range: range as DateRange })}
        aria-label="Date range"
        className="grid gap-0.5"
      >
        {(Object.keys(DATE_RANGE_LABELS) as DateRange[]).map((r) => (
          <label
            key={r}
            htmlFor={`${idPrefix}-${r}`}
            className="flex h-9 cursor-pointer items-center gap-3 rounded-md px-2 text-[13px] hover:bg-hover"
          >
            <Radio id={`${idPrefix}-${r}`} value={r} />
            {r === 'all' ? 'All time' : DATE_RANGE_LABELS[r]}
          </label>
        ))}
      </RadioGroup>
      {filters.range === 'custom' && (
        <div className="mt-2 grid grid-cols-2 gap-2 px-2 pb-1">
          <label className="text-[12px] text-ink-3">
            From
            <Input type="date" value={filters.from} onChange={(e) => onChange({ from: e.target.value })} className="mt-1 h-8 text-[13px]" />
          </label>
          <label className="text-[12px] text-ink-3">
            To
            <Input type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => onChange({ to: e.target.value })} className="mt-1 h-8 text-[13px]" />
          </label>
        </div>
      )}
    </div>
  )
}

export function DateMenu({
  filters,
  onChange,
}: {
  filters: PostFilters
  onChange: (patch: Partial<PostFilters>) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FilterTrigger active={filters.range !== 'all'} icon={CalendarRange}>
          {DATE_RANGE_LABELS[filters.range]}
        </FilterTrigger>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[256px] p-1">
        <DropdownMenuLabelStatic>Date range</DropdownMenuLabelStatic>
        <DateRangeOptions filters={filters} onChange={onChange} idPrefix="date-menu" />
      </PopoverContent>
    </Popover>
  )
}

function DropdownMenuLabelStatic({ children }: { children: string }) {
  return <p className="px-2 pt-1.5 pb-1 text-[11px] font-medium tracking-wide text-ink-3">{children}</p>
}
