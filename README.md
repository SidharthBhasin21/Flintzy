# Flintzy

A frontend-only social media post scheduler. Plan, schedule and track posts for X, Instagram, Facebook and TikTok. There's no backend: every API call is mocked in the browser, and nothing is actually published.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + production build
npm run lint
```

## What it does

- **Queue.** Posts are grouped by day in your local time zone. Today and upcoming days come first, then an "Earlier" section. Each row shows the media, platforms, local time, a relative time ("in 2h 15m") and the status.
- **Calendar.** A month view with per-day status dots on phones and post previews on larger screens. Select a day to see its posts.
- **Search and filters.** Text search, platform, status and date range (today, tomorrow, this week, this month, or a custom range). Every filter lives in the URL, so views can be linked and the Back button works. On phones, filters open in a bottom sheet that shows a live result count.
- **Composer.**
  - Each platform toggle shows that platform's live character count against its limit (X 280, Instagram 2,200, Facebook 5,000, TikTok 2,200).
  - Instagram and TikTok require an image.
  - Times must be at least 5 minutes in the future.
  - The Preview tab highlights any text over the limit.
  - <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Enter</kbd> submits.
- **Retry failed posts (optimistic).** The post flips to Published straight away while the request runs. If the request fails, the original post comes back with the latest error and a toast explains why.
- **Edit, delete, copy.** Editing a failed post reschedules it. Delete asks for confirmation, removes the post immediately, and restores it if the request fails.
- **States.** Loading skeletons, an empty queue, no-results, and a load error with retry.
- **Responsive.** A three-column layout from 1280px, with the composer docked on the right. Smaller screens get a sheet-based composer and full-screen post details.

Keyboard: <kbd>C</kbd> new post · <kbd>/</kbd> search · <kbd>Esc</kbd> close.

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
│   ├── posts/       status badge
│   └── shared/      app shell, logo, state panel, hooks (media query, hotkeys)
├── features/
│   ├── posts/       store (reducer + provider), actions, filters, grouping, queue UI
│   ├── composer/    form hook, validation, composer UI
│   └── calendar/    month grid
├── data/posts.json  seed data
├── lib/             api (mock), dates, constants, utils
└── pages/           QueuePage, CalendarPage
```

Stack: React 19 (with the React Compiler), TypeScript, Vite, Tailwind CSS v4, Radix primitives, date-fns, React Router, Lucide and Sonner. Photos are from Unsplash via Lorem Picsum and are bundled locally in `public/media`. Platform logos are from Simple Icons (CC0).
