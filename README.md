# Flintzy

A frontend-only social media post scheduler. Plan, schedule and track posts for X, Instagram, Facebook and TikTok. There's no backend: every API call is mocked in the browser, and nothing is actually published.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run lint
```

## What it does

- **Queue timeline.** Posts sit on a vertical rail grouped by day, in your local time, with a live **Now** line inside today. Today and upcoming days come first, then an "Earlier" section. Each status has its own marker on the rail: a hollow ring for scheduled, a solid dot for published, a red dot for failed.
- **Overview column.** On wide screens a right-hand column shows:
  - the next post with a countdown
  - a 7-day bar chart of scheduled posts (click a bar to open that day in the calendar)
  - failed posts that need attention, with one-click retry
  - accounts, which double as platform filters
- **Calendar.** A month grid with post previews (status dots on phones). Select a day to see its timeline.
- **Search and filters.** Status tabs with live counts, text search, platform icon toggles and a date range (today, tomorrow, this week, this month, or a custom range). Every filter lives in the URL, so views can be linked and the Back button works.
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

## Design

Paper-toned neutrals with a single ember accent, a nod to the "flint" in Flintzy. The accent is reserved for primary actions, the Now line and today in the 7-day chart. Type is Schibsted Grotesk throughout (bold and tightly tracked for headings), with IBM Plex Mono for times and counts. Status colour is muted and always paired with a shape or a word. Light and dark themes follow the system setting.

Motion (GSAP, `src/lib/motion.ts`) only explains a change. Rows stagger in when the list or filters change, the Now line draws across, a post's marker pops and its row flashes when its status changes in place, the status-tab underline slides, and the 7-day bars grow in. Everything animates transform or opacity only, is cleaned up by `useGSAP`, and is skipped when the OS asks for reduced motion.

## Time zones

`scheduledAt` is always stored as a UTC ISO string. The UI shows local time (the browser's zone), and the composer converts a local wall-clock date and time to UTC in exactly one place: `localInputsToUtcIso` in `src/lib/dates.ts`. That conversion is DST-aware. The composer and post details show both the local time and its UTC equivalent.

## Mock backend

`src/lib/api.ts` simulates latency and persists changes to `sessionStorage`. A reload keeps your edits; a new tab starts fresh.

- Seed data lives in `src/data/posts.json`. It's rebased on load so the queue is always relative to today, and post statuses always agree with the clock.
- Retrying a post that failed because of a rate limit or timeout succeeds. Retrying one with an expired session fails again, as it would in production.

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
│   ├── posts/       status badge, timeline node, status label
│   └── shared/      app shell (top bar), logo, state panel, hotkey hook
├── features/
│   ├── posts/       store (reducer + provider), actions, filters, grouping, timeline, overview
│   ├── composer/    form hook, validation, composer UI
│   └── calendar/    month grid
├── data/posts.json  seed data
├── lib/             api (mock), dates, constants, utils
└── pages/           QueuePage, CalendarPage
```

Stack: React 19 (with the React Compiler), TypeScript, Vite, Tailwind CSS v4, Radix primitives, date-fns, React Router, Lucide and Sonner. Fonts are Schibsted Grotesk and IBM Plex Mono, self-hosted via Fontsource. Motion uses GSAP (`@gsap/react`). Photos are from Unsplash via Lorem Picsum and are bundled locally in `public/media`. Platform logos are from Simple Icons (CC0).
