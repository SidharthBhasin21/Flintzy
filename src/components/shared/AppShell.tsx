import { Plus } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { ComposerHost } from '@/features/composer/components/ComposerHost'
import { usePostActions } from '@/features/posts/actions/context'
import { useNow } from '@/features/posts/hooks/useNow'
import { parseFilters, writeFilters } from '@/features/posts/utils/filters'
import { WORKSPACE } from '@/lib/constants'
import { formatLocal, localTimeZone, zoneAbbreviation } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { LogoMark } from './Logo'
import { useHotkey } from './useHotkey'

const NAV = [
  { to: '/', label: 'Queue' },
  { to: '/calendar', label: 'Calendar' },
] as const

/** Carry filters across views but drop panel state (open post, composer). */
function useFilterSearch() {
  const { search } = useLocation()
  const query = writeFilters(new URLSearchParams(), parseFilters(new URLSearchParams(search))).toString()
  return query ? `?${query}` : ''
}

export function AppShell() {
  const actions = usePostActions()
  useHotkey('c', actions.create)

  return (
    <div className="min-h-dvh">
      <TopBar />
      <main id="main">
        <Outlet />
      </main>
      <ComposerHost />
    </div>
  )
}

function TopBar() {
  const actions = usePostActions()
  const search = useFilterSearch()

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <LogoMark />
          <span className="text-[17px] leading-none font-bold tracking-[-0.035em]">Flintzy</span>
          <span aria-hidden className="text-[18px] font-light text-line-strong max-sm:hidden">/</span>
          <span className="truncate text-[13px] font-medium text-ink-2 max-sm:hidden">{WORKSPACE.name}</span>
        </div>

        <nav aria-label="Views" className="ml-4 hidden md:block">
          <ViewSwitch search={search} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LocalClock />
          <span
            title={`${WORKSPACE.user.name} · demo workspace, nothing is really published`}
            className="hidden size-8 items-center justify-center rounded-full border border-line bg-surface text-[11px] font-semibold text-ink-2 sm:inline-flex"
          >
            {WORKSPACE.user.initials}
          </span>
          <Button variant="accent" onClick={actions.create} className="max-sm:px-2.5">
            <Plus strokeWidth={2.25} />
            <span className="max-sm:sr-only">New post</span>
            <Kbd className="ml-1 border-white/30 text-white/80 max-md:hidden">C</Kbd>
          </Button>
        </div>
      </div>

      <nav aria-label="Views" className="border-t border-line px-4 py-2 md:hidden">
        <ViewSwitch search={search} className="w-full" />
      </nav>
    </header>
  )
}

function ViewSwitch({ search, className }: { search: string; className?: string }) {
  return (
    <div className={cn('inline-flex h-8 items-center rounded-lg bg-sunken p-0.5', className)}>
      {NAV.map(({ to, label }) => (
        <NavLink
          key={to}
          to={{ pathname: to, search }}
          end
          className={({ isActive }) =>
            cn(
              'inline-flex h-7 flex-1 items-center justify-center rounded-md px-3.5 text-[13px] font-medium transition-colors',
              isActive
                ? 'bg-surface text-ink shadow-[0_0_0_1px_var(--line),0_1px_2px_rgb(0_0_0/0.05)]'
                : 'text-ink-2 hover:text-ink',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </div>
  )
}

/** Live local time with its zone, a constant reminder of which clock the UI speaks. */
function LocalClock() {
  const now = useNow(15_000)
  return (
    <p
      className="mr-1 hidden items-baseline gap-1.5 text-[12.5px] text-ink-3 tabular-nums lg:flex"
      title={`All times are shown in ${localTimeZone()} and stored in UTC`}
    >
      <span className="font-mono text-ink-2">{formatLocal(now.toISOString(), 'h:mm a')}</span>
      {zoneAbbreviation(now)}
    </p>
  )
}
