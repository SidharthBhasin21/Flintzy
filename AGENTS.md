# AGENTS.md

## Project: Social Media Post Scheduler

## 1. Objective

Build a polished, production-quality frontend-only social media post scheduler.

The application allows users to:

- View scheduled, published, and failed social media posts.
- Group posts by day.
- Search and filter posts.
- Create/schedule posts for multiple social platforms.
- Validate platform-specific character limits.
- Handle UTC/local timezone conversion correctly.
- Retry failed posts with optimistic UI updates.
- Handle loading, empty, and error states.
- Work well on desktop and mobile.

This is a **frontend-only assignment**.

There must be:

- No real authentication.
- No real social media integrations.
- No real publishing.
- No real external API calls.

All backend/API behavior must be mocked.

---

# 2. Product Principles

The implementation should feel like a real SaaS product rather than a coding-assignment demo.

Prioritize:

1. Clean information hierarchy.
2. Fast interactions.
3. Excellent empty/loading/error states.
4. Responsive behavior.
5. Accessible controls.
6. Realistic mock data.
7. Predictable state transitions.
8. Minimal unnecessary UI.
9. Strong visual polish.
10. Reusable components.

Avoid:

- Generic AI-generated dashboard layouts.
- Excessive cards.
- Excessive gradients.
- Huge headings.
- Unnecessary animations.
- Fake functionality that does not affect state.
- Hardcoded UI states that should be derived from data.
- Duplicated components.
- Giant monolithic React components.

The UI should look like a product that could realistically be shipped.

---

# 3. Tech Stack

Use:

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router if routing is required
- shadcn/ui for primitives where useful
- Lucide React for icons
- date-fns for date/time manipulation
- URLSearchParams / router search params for filters

Do not introduce unnecessary dependencies.

If the repository already contains an established stack, preserve it unless there is a strong reason to change it.

---

# 4. Application Structure

Prefer a feature-oriented structure.

Example:

src/
├── components/
│ ├── ui/
│ ├── platform/
│ ├── posts/
│ └── shared/
│
├── features/
│ ├── posts/
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── utils/
│ │ └── types.ts
│ │
│ └── composer/
│ ├── components/
│ ├── hooks/
│ └── utils/
│
├── data/
│ └── posts.json
│
├── lib/
│ ├── api.ts
│ ├── constants.ts
│ ├── dates.ts
│ └── utils.ts
│
├── pages/
│ └── PostsPage.tsx
│
└── App.tsx

Adapt the structure to the existing project when appropriate.

---

# 5. Data Model

Every post must contain:

```ts
type Platform = "facebook" | "instagram" | "x" | "tiktok";

type PostStatus = "scheduled" | "published" | "failed";

interface Post {
  id: string;
  content: string;
  platforms: Platform[];
  mediaUrl?: string;
  scheduledAt: string;
  status: PostStatus;
  errorMessage?: string;
}
```
