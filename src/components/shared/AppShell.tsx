import { CalendarDays, Plus, Rows3 } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router'
import { PlatformIcon } from '@/components/platform/PlatformIcon'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { ComposerHost } from '@/features/composer/components/ComposerHost'
import { usePostActions } from '@/features/posts/actions/context'
import { usePostFilters } from '@/features/posts/hooks/usePostFilters'
import { usePosts } from '@/features/posts/store/context'
import { writeFilters, parseFilters } from '@/features/posts/utils/filters'
import { PLATFORMS, PLATFORM_ORDER, WORKSPACE } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { useHotkey } from './useHotkey'

const NAV = [
  { to: '/', label: 'Queue', icon: Rows3 },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
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
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main id="main" className="flex-1">
          <Outlet />
        </main>
      </div>
      <ComposerHost />
    </div>
  )
}

function Sidebar() {
  const actions = usePostActions()
  const { posts, status } = usePosts()
  const { filters, setFilters } = usePostFilters()
  const search = useFilterSearch()
  const scheduled = posts.filter((p) => p.status === 'scheduled')

  return (
    <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col border-r border-line bg-sidebar lg:flex">
      <div className="flex h-14 items-center px-4">
        <Logo />
      </div>

      <div className="px-3">
        <Button variant="primary" className="w-full justify-start" onClick={actions.create}>
          <Plus strokeWidth={2} />
          New post
          <Kbd className="ml-auto">C</Kbd>
        </Button>
      </div>

      <nav aria-label="Views" className="mt-4 space-y-0.5 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={{ pathname: to, search }}
            end
            className={({ isActive }) =>
              cn(
                'flex h-8 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors',
                isActive ? 'bg-selected text-ink' : 'text-ink-2 hover:bg-hover hover:text-ink',
              )
            }
          >
            <Icon className="size-4" strokeWidth={1.75} />
            {label}
            {to === '/' && status === 'ready' && scheduled.length > 0 && (
              <span className="ml-auto text-[12px] font-normal text-ink-3 tabular-nums">{scheduled.length}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <section aria-labelledby="accounts-heading" className="mt-7 px-3">
        <h2 id="accounts-heading" className="mb-1 px-2 text-[11px] font-medium tracking-wide text-ink-3 uppercase">
          Accounts
        </h2>
        <ul className="space-y-0.5">
          {PLATFORM_ORDER.map((p) => {
            const on = filters.platforms.includes(p)
            return (
              <li key={p}>
                <button
                  type="button"
                  aria-pressed={on}
                  title={on ? `Stop filtering by ${PLATFORMS[p].label}` : `Show only ${PLATFORMS[p].label} posts`}
                  onClick={() =>
                    setFilters({ platforms: on ? filters.platforms.filter((x) => x !== p) : [...filters.platforms, p] })
                  }
                  className={cn(
                    'flex h-9 w-full items-center gap-2.5 rounded-md px-2 text-left transition-colors',
                    on ? 'bg-selected' : 'hover:bg-hover',
                  )}
                >
                  <PlatformIcon decorative platform={p} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[13px] text-ink">{PLATFORMS[p].label}</span>
                    <span className="block truncate text-[11.5px] text-ink-3">{PLATFORMS[p].handle}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="mt-auto space-y-3 p-3">
        <p className="rounded-lg border border-line bg-surface/70 px-3 py-2.5 text-[12px] leading-snug text-ink-3">
          <span className="mb-0.5 flex items-center gap-1.5 font-medium text-ink-2">
            <span className="size-1.5 rounded-full bg-warn-bar" aria-hidden />
            Demo workspace
          </span>
          Nothing is really published. Changes stay in this browser tab.
        </p>
        <div className="flex items-center gap-2.5 px-1">
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-selected text-[11px] font-semibold text-ink-2">
            {WORKSPACE.user.initials}
          </span>
          <span className="min-w-0 leading-tight">
            <span className="block truncate text-[13px] font-medium">{WORKSPACE.user.name}</span>
            <span className="block truncate text-[12px] text-ink-3">{WORKSPACE.name}</span>
          </span>
        </div>
      </div>
    </aside>
  )
}

function MobileHeader() {
  const actions = usePostActions()
  const search = useFilterSearch()
  return (
    <header className="border-b border-line bg-canvas lg:hidden">
      <div className="flex h-14 items-center justify-between px-4 pt-[env(safe-area-inset-top)]">
        <Logo />
        <Button variant="primary" size="icon" aria-label="New post" onClick={actions.create} className="rounded-full">
          <Plus strokeWidth={2} />
        </Button>
      </div>
      <nav aria-label="Views" className="flex gap-6 px-4">
        {NAV.map(({ to, label }) => (
          <NavLink
            key={to}
            to={{ pathname: to, search }}
            end
            className={({ isActive }) =>
              cn(
                '-mb-px border-b-2 pb-2.5 text-[13.5px] font-medium transition-colors',
                isActive ? 'border-ink text-ink' : 'border-transparent text-ink-3 hover:text-ink-2',
              )
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}
