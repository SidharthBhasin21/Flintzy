# Flintzy

A frontend-only social media post scheduler. Plan, schedule and track posts for X, Instagram, Facebook and TikTok. There's no backend: every API call is mocked in the browser, and nothing is actually published.

## Getting started

**Prerequisites:** Node.js 20.19+ or 22.12+ (required by Vite 8) and npm.

```bash
git clone <repo-url> flintzy
cd flintzy
npm install
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173).

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reload |
| `npm run build` | Typecheck, then create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Run the TypeScript compiler only |
| `npm run lint` | Run ESLint |

No environment variables, API keys or accounts are needed. To try the error, empty and slow-network states, see [Mock backend](#mock-backend).

## What it does

- **Queue timeline.** Posts sit on a vertical rail grouped by day, in your local time, with a live **Now** line inside today. Today and upcoming days come first, then an "Earlier" section. Each status has its own marker on the rail: a hollow ring for scheduled, a solid dot for published, a red dot for failed.
- **Overview column.** On wide screens a right-hand column shows:
  - the next post with a countdown
  - a 7-day bar chart of scheduled posts (click a bar to open that day in the calendar)
  - failed posts that need attention, with one-click retry
  - accounts, which double as platform filters
- **Calendar.** A month grid with post previews (status dots on phones). Select a day to see its timeline.
- **Search and filters.** Status tabs with live counts, text search, platform icon toggles and a date range (today, tomorrow, this week, this month, or a custom range). Every filter lives in the URL, so any view can be bookmarked or shared.
- **Composer.** A focused two-pane dialog, full screen on phones:
  - platform chips
  - an editor with an inline image attachment (from the library or a pasted URL)
  - ring meters showing each platform's remaining characters (X 280, Instagram 2,200, Facebook 5,000, TikTok 2,200)
  - quick scheduling picks ("In 1 hour", "Tomorrow, 9 AM")
  - a live preview that highlights any text over a platform's limit

  Instagram and TikTok require an image, and times must be at least 5 minutes ahead. <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Enter</kbd> submits.
- **Retry failed posts (optimistic).** The post flips to Published straight away while the request runs. If the request fails, the original post comes back with the latest error and a toast explains why.
- **Edit, delete, copy.** Rescheduling a failed post puts it back in the queue. Delete asks for confirmation, removes the post immediately, and restores it if the request fails.
- **States.** Loading skeletons, an empty queue, no-results, and a load error with retry.
- **Code-split.** The composer, post details and Calendar page load on demand. React, React Router and date-fns ship as separately cached chunks.

Keyboard: <kbd>C</kbd> new post · <kbd>/</kbd> search · <kbd>Esc</kbd> close.

## Key decisions

**A timeline, not a card grid.** A scheduler is about *when* things happen, so I built the queue as a single vertical rail grouped by day, with a live Now line. Upcoming days come first because that's what you act on; past days drop into an "Earlier" section. Card grids look busy and make it hard to scan times, so I avoided them.

**UTC in storage, local time everywhere else.** `scheduledAt` is always a UTC ISO string. The UI only ever shows the browser's local time. The composer collects a local wall-clock date and time and converts it to UTC in exactly one function (`localInputsToUtcIso` in `src/lib/dates.ts`). With one conversion point there's only one place for DST or off-by-one-day bugs to hide. The composer and post details also show the UTC equivalent, so you can always check what will be stored.

**Day grouping uses local days.** Posts are grouped by the local calendar day, not the UTC day. A post at 11:30 PM your time belongs to that evening, even if it's already tomorrow in UTC.

**State in the URL.** Filters, search, the date range, and open panels (composer, post details) all live in search params. Views can be linked and survive a reload. Opening a panel pushes a history entry, so the browser or Android back button closes it instead of leaving the page. Filter changes replace the current entry, so typing in search doesn't flood history. I added a small helper (`useLiveSetSearchParams`) because React Router's updater can receive stale params during fast typing, which made back-to-back updates drop each other's changes.

**A reducer and context instead of a data library.** With one resource (posts) and a mock API, React Query or Redux would be more machinery than the problem needs. A single reducer (`features/posts/store/reducer.ts`) owns load status, posts and a per-post `pending` map. Every transition is a named action, which keeps optimistic updates easy to follow.

**Optimistic where it's safe, confirmed where it isn't.** Retry and delete update the UI immediately and roll back with a toast if the request fails. The `pending` map stops a post from being retried twice at once. Create and edit wait for the server, because showing a post as scheduled before it's accepted would be misleading.

**Validation per platform, not one global limit.** Each platform has its own character limit and media rule in one config (`src/lib/constants.ts`). The composer only blocks on the platforms you've selected and names the ones that are over. Characters are counted as graphemes (`Intl.Segmenter`), so an emoji or an accented letter counts as one character, the way people perceive it.

**A mock backend that behaves like a real one.** `src/lib/api.ts` adds latency, can fail, and persists to `sessionStorage`. The seed data is rebased to today on load, so the demo never looks stale and statuses always agree with the clock: scheduled posts are never in the past, and published or failed posts are never in the future. Query parameters (`?mock=error|empty|slow`) make every UI state easy to reach without editing code.

**Restrained design.** One accent colour, used only for primary actions, the Now line and today in the chart. Status colour is muted and always paired with a shape or a word, so status isn't conveyed by colour alone. Motion only explains a change (a row arriving, a status flipping) and is skipped when the OS asks for reduced motion.

**Feature folders and small components.** Code is organised by feature (`posts`, `composer`, `calendar`), with shared primitives in `components/`. Logic that can be pure (filtering, grouping, validation, date maths) lives in plain functions outside the components, so it's easy to read and test.

**Few dependencies, all purposeful.** Radix for accessible primitives (dialogs, menus, tabs) rather than hand-rolled focus management, date-fns for date maths, Sonner for toasts, GSAP for the handful of animations. The React Compiler handles memoisation, so the components don't need `useMemo`/`useCallback` noise.

## Design

Paper-toned neutrals with a single ember accent, a nod to the "flint" in Flintzy. Type is Schibsted Grotesk throughout (bold and tightly tracked for headings), with IBM Plex Mono for times and counts. Light and dark themes follow the system setting.

Motion (GSAP, `src/lib/motion.ts`): rows stagger in when the list or filters change, the Now line draws across, a post's marker pops and its row flashes when its status changes in place, the status-tab underline slides, and the 7-day bars grow in. Everything animates transform or opacity only and is cleaned up by `useGSAP`.

## Mock backend

`src/lib/api.ts` simulates latency and persists changes to `sessionStorage`. A reload keeps your edits; a new tab starts fresh.

- Seed data lives in `src/data/posts.json` and is rebased on load (see [Key decisions](#key-decisions)).
- Retrying a failed post takes about a second and fails 20% of the time, so you can see both the success path and the rollback.
- Editing a post re-queues it as scheduled. Published posts can't be edited.

Add a query parameter to see the other states:

| URL | Shows |
| --- | --- |
| `/?mock=error` | The first load fails; "Try again" recovers |
| `/?mock=empty` | A brand-new workspace with no posts |
| `/?mock=slow` | 4× latency, to see the loading states |

## Structure

```
src/
├── components/
│   ├── ui/          shadcn-style primitives on Radix (button, dialog/sheet, menu, tabs…)
│   ├── platform/    platform brand marks
│   ├── posts/       status badge
│   └── shared/      app shell (top bar), logo, media thumbnail, state panel, hotkey hook
├── features/
│   ├── posts/       store (reducer + provider), actions, filters, grouping, timeline, overview
│   ├── composer/    form hook, validation, composer UI
│   └── calendar/    month grid
├── data/posts.json  seed data
├── lib/             api (mock), dates, constants, motion, utils
└── pages/           QueuePage, CalendarPage
```

Stack: React 19 (with the React Compiler), TypeScript, Vite, Tailwind CSS v4, Radix primitives, date-fns, React Router, Lucide and Sonner. Fonts are Schibsted Grotesk and IBM Plex Mono, self-hosted via Fontsource. Motion uses GSAP (`@gsap/react`). Photos are from Unsplash via Lorem Picsum and are bundled locally in `public/media`. Platform logos are from Simple Icons (CC0).
