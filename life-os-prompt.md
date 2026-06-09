# Personal Life Operating System — Production Build Prompt

---

## Role

You are a principal software architect and senior full-stack engineer.

---

## Objective

Build a **complete, production-ready, full-stack personal life operating system** from scratch.

### Constraints

- Do **not** create a demo or MVP
- Design and implement a **scalable, SaaS-quality** application
- SaaS-quality means:
  - Professional UI/UX
  - Clean, feature-based architecture
  - Secure authentication
  - Proper relational database design with normalized schemas
  - Reusable, composable components
  - Maintainable, type-safe code
  - Scalable structure for future growth

### Explicitly Excluded

Do **not** add:

- Billing or subscription systems
- Docker or Kubernetes
- Microservices
- CI/CD pipelines
- Enterprise cloud infrastructure

---

## Technology Stack

### Frontend

| Concern | Technology |
|---|---|
| Framework | React 18+ |
| Build Tool | Vite |
| Language | TypeScript (strict mode) |
| Styling | TailwindCSS v3 |
| Component Library | shadcn/ui |
| Server State | TanStack Query (React Query) v5 |
| Client State | Zustand |
| Routing | React Router v6 |

### Backend

| Concern | Technology |
|---|---|
| Runtime | Node.js 20+ |
| Framework | Express.js |
| Language | TypeScript (strict mode) |
| ORM | Prisma ORM |
| Validation | Zod |

### Database

| Concern | Technology |
|---|---|
| Provider | Supabase |
| Engine | PostgreSQL |
| ORM | Prisma ORM |
| Migrations | Prisma Migrate |
| Row-Level Security | Supabase RLS Policies |

### Authentication

| Concern | Technology |
|---|---|
| Provider | Supabase Auth |
| Client SDK | `@supabase/supabase-js` v2 |
| Session Management | Supabase-managed (access + refresh tokens, automatic rotation) |
| Token Verification (backend) | Supabase JWT secret via `jsonwebtoken` |
| Email Flows | Supabase Auth built-in (verification, password reset) |

---

## Application Overview

The application is an **all-in-one personal tracking and self-improvement platform**. Users manage every dimension of their daily life from a single, cohesive interface.

### Core Modules

1. Dashboard
2. Habit Tracker
3. Mood Tracker
4. Sleep Tracker
5. Hydration Tracker
6. Breathing Exercises
7. Journal System
8. Goals System
9. Calendar
10. Analytics
11. Data Exports
12. Settings & Personalization

All data is **scoped per authenticated user** and protected by both JWT middleware and Supabase Row-Level Security policies.

---

## Authentication System

### Endpoints to Implement

| Action | Description |
|---|---|
| Sign Up | Register with name, email, password |
| Email Verification | Token-based email confirmation |
| Login | Issue access token + refresh token |
| Logout | Revoke refresh token, clear cookies |
| Refresh Token | Rotate refresh token, issue new access token |
| Forgot Password | Generate a time-limited reset token |
| Reset Password | Consume reset token, update password |
| Change Password | Authenticated password update |
| Remember Me | Extended refresh token TTL |
| Multi-device Sessions | Track and list active sessions per user |
| Revoke Session | Invalidate a specific device session |
| Profile Management | Update name, avatar, email |

### Token Design

- **Access Token**: Short-lived JWT (15 minutes), stored in memory on the client
- **Refresh Token**: Long-lived (7 days, 30 days with Remember Me), stored in HTTP-only Secure cookie, hashed in database
- **Refresh Token Rotation**: Each use issues a new token and invalidates the old one
- **Session Table**: Track `deviceId`, `userAgent`, `ipAddress`, `lastUsedAt` per refresh token

---

## Dashboard

The dashboard is the application's home screen, providing a real-time overview of the user's day.

### Widgets

- Daily Overview (date, day greeting, completion ring)
- Active Goals (progress bars)
- Habit Completion (today's habits with quick-check UI)
- Mood Summary (last logged mood + trend indicator)
- Hydration Progress (progress bar toward daily goal)
- Sleep Summary (last night's hours + quality rating)
- Recent Journal Entries (last 3 entries with excerpts)
- Weekly Trends (sparklines across all tracked modules)
- Quick Actions (log mood, add water, start breathing session, new journal entry)

### Dashboard Personalization

Users can:

- Add, remove, reorder, and resize widgets
- Pin widgets to fixed positions
- Save and restore named layouts
- Toggle compact vs. comfortable widget density

All layout configurations are stored in the database and synced across devices.

---

## Feature Specifications

### Habit Tracker

- Create, edit, delete, and archive habits
- Daily, weekly, and monthly tracking frequencies
- Habit streaks (current and longest)
- Completion success rate (per habit and aggregate)
- Habit categories (user-defined, color-coded)
- Optional reminder times per habit

### Mood Tracker

- Mood score entry (scale of 1–10 with emoji indicators)
- Optional free-text mood notes
- Full mood history log
- Mood calendar (color-coded by score)
- Trend visualization (line chart over time)
- Mood analytics (average per period, distribution)
- AI-ready insight hooks (placeholder for future integration)

### Sleep Tracker

- Log sleep start time and end time
- Automatic duration calculation
- Sleep quality rating (1–5)
- Sleep notes
- Weekly and monthly analytics (charts and averages)
- Recommended vs. actual sleep comparison

### Hydration Tracker

- Log water intake with amount and time
- Custom drink templates (e.g., "Coffee 200ml", "Protein Shake 350ml")
- Daily hydration goal (configurable per user)
- Daily, weekly, and monthly progress views
- Intake history with timestamps

### Breathing Module

- Guided breathing sessions with a visual animation timer
- Built-in techniques: Box Breathing, 4-7-8, Diaphragmatic, Alternate Nostril
- User-defined custom techniques (inhale / hold / exhale / hold durations)
- Session timer with audio/visual cues
- Full session history log
- Analytics: session frequency, total minutes, technique usage

### Journal System

- Rich text editor (Tiptap or similar)
- Create, edit, and delete entries
- Full-text search across entries
- User-defined tags and categories
- Favorite/starred entries
- Entry word count tracking
- Analytics: writing frequency, words per entry, top tags

### Goals System

- Create goals with title, description, and deadline
- Sub-milestones per goal (ordered list with completion state)
- Manual progress percentage input
- Goal status: Active, Completed, Archived, On Hold
- Analytics: goals completed per period, average completion time

### Calendar

- Monthly calendar view
- Each day shows a summary dot/icon for each logged module (habit, mood, sleep, hydration, journal, breathing)
- Click a day to view the full activity summary for that date
- Historical data browsable for all past months

---

## Analytics Module

Generate cross-module analytics with interactive charts.

### Scope

Each module (Habits, Mood, Sleep, Hydration, Breathing, Journal, Goals) has its own analytics view.

### Chart Types

- **Line Charts**: Trends over time (daily, weekly, monthly)
- **Bar Charts**: Comparisons (e.g., habit completions per week)
- **Heatmaps**: Calendar heatmaps for streaks and mood
- **Donut / Pie Charts**: Composition breakdowns (e.g., habit categories)
- **Correlation Analysis**: Overlay mood vs. sleep or mood vs. habit completion

### Global Analytics Dashboard

- Exportable progress reports (per module or combined)
- Date range selector
- All charts must use dynamic theming (respect the active theme's color palette)
- Use **Recharts** for all chart components

---

## Data Export

Users can export their personal data in the following formats:

| Format | Scope |
|---|---|
| CSV | Per-module tabular data |
| JSON | Full account data backup |
| Markdown | Journal entries |
| PDF | Progress reports (via server-side rendering or client-side generation) |

---

## Database Design (PostgreSQL via Supabase + Prisma)

Design a fully normalized relational schema. Use Prisma schema language. All tables must include `created_at` and `updated_at` timestamps managed by Prisma (`@default(now())` and `@updatedAt`).

### Tables

#### `users`

```prisma
model User {
  id                String    @id @default(cuid())
  name              String
  email             String    @unique
  passwordHash      String
  emailVerified     Boolean   @default(false)
  emailVerifyToken  String?
  emailVerifyExpiry DateTime?
  avatarUrl         String?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  preferences       UserPreferences?
  sessions          UserSession[]
  passwordResets    PasswordReset[]
  habits            Habit[]
  habitLogs         HabitLog[]
  moodLogs          MoodLog[]
  sleepLogs         SleepLog[]
  hydrationLogs     HydrationLog[]
  drinkTemplates    DrinkTemplate[]
  journalEntries    JournalEntry[]
  breathingSessions BreathingSession[]
  breathingTechniques BreathingTechnique[]
  goals             Goal[]
  notifications     Notification[]
}
```

#### `user_preferences`

Stores all per-user UI settings and dashboard layout configuration.

Fields: `userId`, `theme`, `font`, `fontSize`, `densityMode`, `accentColor`, `sidebarWidth`, `sidebarCollapsed`, `dashboardLayout` (JSONB), `reducedMotion`, `highContrast`.

#### `user_sessions`

Tracks refresh tokens and multi-device sessions.

Fields: `id`, `userId`, `tokenHash`, `deviceId`, `userAgent`, `ipAddress`, `expiresAt`, `lastUsedAt`, `revoked`.

#### `password_resets`

Fields: `id`, `userId`, `tokenHash`, `expiresAt`, `usedAt`.

#### `habits`

Fields: `id`, `userId`, `name`, `description`, `category`, `color`, `icon`, `frequency` (enum: DAILY / WEEKLY / MONTHLY), `targetDays` (array for weekly), `reminderTime`, `archived`, `archivedAt`, `createdAt`, `updatedAt`.

#### `habit_logs`

Fields: `id`, `habitId`, `userId`, `completedAt` (date), `note`, `createdAt`.

Unique constraint on `(habitId, completedAt)`.

#### `mood_logs`

Fields: `id`, `userId`, `score` (Int 1–10), `note`, `loggedAt`, `createdAt`.

#### `sleep_logs`

Fields: `id`, `userId`, `sleepStart`, `sleepEnd`, `durationMinutes` (computed), `quality` (Int 1–5), `note`, `loggedAt`, `createdAt`, `updatedAt`.

#### `hydration_logs`

Fields: `id`, `userId`, `amount` (Float, ml), `drinkTemplateId` (nullable FK), `note`, `loggedAt`, `createdAt`.

#### `drink_templates`

Fields: `id`, `userId`, `name`, `amount` (Float, ml), `icon`, `color`, `isDefault`, `createdAt`, `updatedAt`.

#### `journal_entries`

Fields: `id`, `userId`, `title`, `content` (text, rich HTML or JSON), `tags` (array), `category`, `favorited`, `wordCount`, `createdAt`, `updatedAt`.

Full-text search index on `title` and `content`.

#### `breathing_techniques`

Fields: `id`, `userId` (nullable — null means built-in), `name`, `description`, `inhaleDuration`, `holdInDuration`, `exhaleDuration`, `holdOutDuration`, `cycles`, `isBuiltIn`, `createdAt`, `updatedAt`.

#### `breathing_sessions`

Fields: `id`, `userId`, `techniqueId`, `durationSeconds`, `cyclesCompleted`, `note`, `completedAt`, `createdAt`.

#### `goals`

Fields: `id`, `userId`, `title`, `description`, `status` (enum: ACTIVE / COMPLETED / ARCHIVED / ON\_HOLD), `progress` (Float 0–100), `deadline`, `completedAt`, `createdAt`, `updatedAt`.

#### `goal_milestones`

Fields: `id`, `goalId`, `title`, `completed`, `completedAt`, `order`, `createdAt`, `updatedAt`.

#### `notifications`

Fields: `id`, `userId`, `type`, `title`, `body`, `read`, `readAt`, `createdAt`.

### Row-Level Security (RLS)

Enable RLS on all tables in Supabase. Each table must have a policy that restricts all reads, inserts, updates, and deletes to rows where `userId = auth.uid()` (or the equivalent using the authenticated JWT `sub` claim passed as a request header/setting).

### Database Relationships

- `User` → `UserPreferences`: One-to-one
- `User` → `UserSession`: One-to-many
- `User` → `Habit` → `HabitLog`: One-to-many chain
- `User` → `MoodLog`, `SleepLog`, `HydrationLog`: One-to-many
- `User` → `DrinkTemplate` → `HydrationLog`: One-to-many with optional FK
- `User` → `BreathingTechnique` → `BreathingSession`: One-to-many chain
- `User` → `JournalEntry`: One-to-many
- `User` → `Goal` → `GoalMilestone`: One-to-many chain
- `User` → `Notification`: One-to-many

---

## Backend Architecture

### Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── env.ts              # Zod-validated environment variables
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── supabase.ts         # Supabase admin client (optional, for RLS bypass)
│   ├── middleware/
│   │   ├── auth.middleware.ts  # JWT verification, attach user to req
│   │   ├── error.middleware.ts # Centralized error handler
│   │   ├── validate.middleware.ts # Zod schema validation factory
│   │   └── rateLimit.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.schema.ts  # Zod schemas
│   │   ├── habits/
│   │   ├── mood/
│   │   ├── sleep/
│   │   ├── hydration/
│   │   ├── breathing/
│   │   ├── journal/
│   │   ├── goals/
│   │   ├── analytics/
│   │   ├── calendar/
│   │   ├── exports/
│   │   ├── notifications/
│   │   └── user/
│   ├── shared/
│   │   ├── types/
│   │   ├── utils/
│   │   └── constants/
│   ├── app.ts                  # Express app setup
│   └── server.ts               # HTTP server entry point
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── .env
└── package.json
```

### Module Structure (per feature)

Each feature module follows the same pattern:

```
modules/<feature>/
├── <feature>.router.ts      # Express router, route definitions
├── <feature>.controller.ts  # Request/response handling only
├── <feature>.service.ts     # Business logic, Prisma queries
└── <feature>.schema.ts      # Zod validation schemas
```

### Security Middleware Stack

Apply the following to all routes in order:

1. **Helmet** — HTTP security headers
2. **CORS** — Restricted to frontend origin, credentials allowed
3. **Global Rate Limiter** — 100 requests / 15 minutes per IP
4. **Auth Rate Limiter** — 10 requests / 15 minutes on `/auth/*` routes
5. **Body Parser** — JSON with 10kb limit
6. **HPP** — HTTP Parameter Pollution prevention
7. **XSS Sanitization** — Sanitize all string inputs
8. **Auth Middleware** — JWT verification on protected routes
9. **Centralized Error Handler** — Final middleware, maps errors to HTTP responses

### API Route Structure

All routes are versioned under `/api/v1/`.

```
POST   /api/v1/auth/register
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
PATCH  /api/v1/auth/change-password
GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/:sessionId

GET    /api/v1/user/me
PATCH  /api/v1/user/me
GET    /api/v1/user/preferences
PATCH  /api/v1/user/preferences

GET    /api/v1/habits
POST   /api/v1/habits
GET    /api/v1/habits/:id
PATCH  /api/v1/habits/:id
DELETE /api/v1/habits/:id
PATCH  /api/v1/habits/:id/archive
GET    /api/v1/habits/:id/logs
POST   /api/v1/habits/:id/logs
DELETE /api/v1/habits/:id/logs/:logId

GET    /api/v1/mood
POST   /api/v1/mood
GET    /api/v1/mood/:id
PATCH  /api/v1/mood/:id
DELETE /api/v1/mood/:id

GET    /api/v1/sleep
POST   /api/v1/sleep
GET    /api/v1/sleep/:id
PATCH  /api/v1/sleep/:id
DELETE /api/v1/sleep/:id

GET    /api/v1/hydration
POST   /api/v1/hydration
DELETE /api/v1/hydration/:id
GET    /api/v1/hydration/templates
POST   /api/v1/hydration/templates
PATCH  /api/v1/hydration/templates/:id
DELETE /api/v1/hydration/templates/:id

GET    /api/v1/breathing/techniques
POST   /api/v1/breathing/techniques
PATCH  /api/v1/breathing/techniques/:id
DELETE /api/v1/breathing/techniques/:id
GET    /api/v1/breathing/sessions
POST   /api/v1/breathing/sessions
GET    /api/v1/breathing/sessions/:id

GET    /api/v1/journal
POST   /api/v1/journal
GET    /api/v1/journal/:id
PATCH  /api/v1/journal/:id
DELETE /api/v1/journal/:id
POST   /api/v1/journal/:id/favorite

GET    /api/v1/goals
POST   /api/v1/goals
GET    /api/v1/goals/:id
PATCH  /api/v1/goals/:id
DELETE /api/v1/goals/:id
POST   /api/v1/goals/:id/milestones
PATCH  /api/v1/goals/:id/milestones/:milestoneId
DELETE /api/v1/goals/:id/milestones/:milestoneId

GET    /api/v1/analytics/habits
GET    /api/v1/analytics/mood
GET    /api/v1/analytics/sleep
GET    /api/v1/analytics/hydration
GET    /api/v1/analytics/breathing
GET    /api/v1/analytics/journal
GET    /api/v1/analytics/goals
GET    /api/v1/analytics/overview

GET    /api/v1/calendar/:year/:month

GET    /api/v1/exports/json
GET    /api/v1/exports/csv/:module
GET    /api/v1/exports/markdown/journal
GET    /api/v1/exports/pdf/report

GET    /api/v1/notifications
PATCH  /api/v1/notifications/:id/read
PATCH  /api/v1/notifications/read-all
```

### Standardized API Response Shape

**Success:**

```ts
{
  success: true,
  data: T,
  meta?: { page: number; limit: number; total: number; }
}
```

**Error:**

```ts
{
  success: false,
  error: {
    code: string,      // e.g. "VALIDATION_ERROR", "NOT_FOUND"
    message: string,
    details?: ZodIssue[]
  }
}
```

---

## Frontend Architecture

### Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx          # React Router configuration
│   │   └── providers.tsx       # QueryClient, ThemeProvider, Toaster
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/     # LoginForm, RegisterForm, etc.
│   │   │   ├── hooks/          # useAuth, useLogin, useRegister
│   │   │   ├── pages/          # LoginPage, RegisterPage, etc.
│   │   │   ├── api.ts          # API call functions
│   │   │   └── types.ts
│   │   ├── dashboard/
│   │   ├── habits/
│   │   ├── mood/
│   │   ├── sleep/
│   │   ├── hydration/
│   │   ├── breathing/
│   │   ├── journal/
│   │   ├── goals/
│   │   ├── analytics/
│   │   ├── calendar/
│   │   ├── exports/
│   │   └── settings/
│   ├── shared/
│   │   ├── api/
│   │   │   ├── client.ts       # Axios instance with interceptors
│   │   │   └── queryKeys.ts    # TanStack Query key factory
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── layout/         # AppShell, Sidebar, Topbar
│   │   │   ├── charts/         # Recharts wrappers
│   │   │   ├── feedback/       # SkeletonLoader, EmptyState, ErrorState
│   │   │   └── common/         # Avatar, Badge, ProgressRing, etc.
│   │   ├── hooks/
│   │   │   ├── useMediaQuery.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useLocalStorage.ts
│   │   ├── stores/
│   │   │   ├── authStore.ts    # Zustand: user, access token
│   │   │   └── uiStore.ts      # Zustand: sidebar, modals
│   │   └── types/
│   ├── styles/
│   │   ├── globals.css         # Tailwind base + CSS variable definitions
│   │   └── themes.css          # All theme variable overrides
│   └── main.tsx
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### State Management Strategy

| Concern | Solution |
|---|---|
| Server data (API responses) | TanStack Query — cache, refetch, invalidation |
| Auth state (user, token) | Zustand `authStore` |
| UI state (sidebar, modals) | Zustand `uiStore` |
| Form state | React Hook Form + Zod resolver |
| URL/navigation state | React Router search params |

### API Client

Use **Axios** with:

- Base URL from environment variable
- `withCredentials: true` (for cookie-based refresh token)
- Request interceptor: attach access token from Zustand store to `Authorization: Bearer` header
- Response interceptor: on 401, attempt token refresh, retry original request once; on second 401, redirect to login

### Custom Hook Pattern (per feature)

```ts
// features/habits/hooks/useHabits.ts
export const useHabits = () => useQuery({
  queryKey: queryKeys.habits.list(),
  queryFn: habitsApi.getAll,
});

export const useCreateHabit = () => useMutation({
  mutationFn: habitsApi.create,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.habits.all }),
});
```

---

## UI/UX System

### Design System Principles

The interface must feel comparable to **Notion, Linear, Arc Browser, Obsidian, Todoist, and Raycast** — clean, intentional, premium, and fast.

Every screen requires:

- Strong visual hierarchy
- Consistent spacing (use the 4px base grid via Tailwind)
- Modern card designs with subtle depth
- Meaningful micro-interactions
- Smooth transitions (respecting `prefers-reduced-motion`)
- Excellent readability across all themes

### Design Tokens

Define all tokens as CSS custom properties in `:root` and override per theme. Token categories:

```css
/* Colors */
--color-background
--color-surface
--color-surface-raised
--color-border
--color-border-subtle
--color-text-primary
--color-text-secondary
--color-text-disabled
--color-accent
--color-accent-hover
--color-accent-subtle
--color-success
--color-warning
--color-error

/* Typography */
--font-sans
--font-serif
--font-mono
--font-size-base
--font-size-sm
--font-size-lg
--font-size-xl

/* Spacing */
--spacing-1 through --spacing-16

/* Radius */
--radius-sm
--radius-md
--radius-lg
--radius-full

/* Shadow */
--shadow-sm
--shadow-md
--shadow-lg

/* Transition */
--transition-fast   (100ms)
--transition-base   (200ms)
--transition-slow   (350ms)
```

### Theme Engine

Implement a theme engine using CSS variables. The active theme class (e.g., `.theme-dracula`) is applied to `<html>` and overrides the default token values.

#### Built-in Themes (11)

1. Light
2. Dark
3. Gruvbox
4. Catppuccin (Mocha)
5. Nord
6. Dracula
7. Tokyo Night
8. Everforest
9. Solarized Dark
10. One Dark
11. Rosé Pine

#### Theme System Requirements

- Live theme switching without page reload
- Theme preference persisted to database (synced across devices)
- Theme preview cards in Settings
- All chart colors pull from CSS variable tokens (theme-aware)
- All shadcn/ui components styled via token overrides, not class overrides

### Typography System

Users can select their preferred font family and font size.

#### Available Fonts

**Sans-serif:** Inter, Geist, Manrope, Plus Jakarta Sans

**Serif:** Merriweather, Source Serif 4

**Monospace:** JetBrains Mono, Fira Code, IBM Plex Mono

Load fonts from **Google Fonts** via Vite plugin or `@import`. Apply the selected font by setting `--font-sans` (or `--font-serif` / `--font-mono`) on `:root`.

#### Typography Features

- Font family selection with live preview
- Font size slider (12px–20px base, stored as a CSS multiplier)
- Density mode: Compact (tighter line heights, smaller padding) / Comfortable (default) / Spacious
- Readability mode: max-width constraint on content areas, increased line height

### Layout Customization

- Sidebar width: adjustable via drag handle (min 200px, max 320px)
- Sidebar behavior: persistent (always visible) or auto-collapse on mobile
- Dashboard widget grid: drag-and-drop reordering via `@dnd-kit/core`
- Widget visibility: toggle per widget in Settings
- Card density: controlled by density mode token

### Motion System

Use Framer Motion for:

- Page transitions (fade + slight vertical slide)
- Modal / sheet open/close
- Toast notifications (slide in from bottom-right)
- Sidebar expand/collapse
- Theme transition (cross-fade on `background-color`)
- Skeleton loader shimmer

All animations must:

- Complete in under 350ms
- Respect `prefers-reduced-motion` (disable or minimize)
- Use `will-change: transform` only during animation, removed after

### Accessibility Requirements

- Full keyboard navigation with visible focus rings
- ARIA labels on all interactive elements
- `role` and `aria-live` on dynamic content
- Support for screen readers (test with VoiceOver/NVDA)
- Reduced motion mode toggle in Settings
- High contrast mode toggle in Settings
- Adjustable text scaling (scales the base font size token)
- Color contrast ratio minimum AA (4.5:1 for text)

### Loading, Empty, and Error States

Every data-fetching view must implement all three states:

| State | Implementation |
|---|---|
| Loading | Skeleton loaders matching the shape of the loaded content |
| Empty | Illustrated empty state with a clear call-to-action |
| Error | Error state with message and retry button |
| Offline | Banner detecting `navigator.onLine` with offline indicator |
| Success | Subtle success feedback (toast or inline confirmation) |

### Mobile Experience

- Fully responsive at 320px, 375px, 768px, 1024px, 1440px breakpoints
- Bottom navigation bar on mobile (replaces sidebar)
- Touch-friendly tap targets (minimum 44×44px)
- Swipe-to-delete on list items where appropriate
- Optimized dashboard layout (single column, stacked widgets)
- Pull-to-refresh on mobile list views

---

## User Preference Persistence

All per-user preferences must be stored in the `user_preferences` table and synced across devices. The frontend reads preferences on login and applies them before the first render to avoid a flash of unstyled content (FOUC).

Preferences to sync:

| Preference | Type | Default |
|---|---|---|
| `theme` | string | `dark` |
| `font` | string | `inter` |
| `fontSize` | number | 15 |
| `densityMode` | enum | `comfortable` |
| `accentColor` | string (hex) | `#6366f1` |
| `sidebarWidth` | number | 260 |
| `sidebarCollapsed` | boolean | false |
| `dashboardLayout` | JSON | default layout |
| `reducedMotion` | boolean | false |
| `highContrast` | boolean | false |

---

## Security Requirements

### Backend

- **Helmet**: Set `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
- **CORS**: Whitelist only `FRONTEND_URL`, allow credentials
- **Rate Limiting**: Express-rate-limit with Redis store (or in-memory for single instance)
- **XSS Protection**: `xss-clean` or manual sanitization on all string inputs
- **SQL Injection Prevention**: Prisma's parameterized queries prevent injection by default
- **bcrypt**: Password hashing with salt rounds ≥ 12
- **JWT**: Sign with `RS256` (asymmetric) or `HS256` with a 64-byte secret; include `exp`, `iat`, `sub` claims only
- **Refresh Token Rotation**: Hash refresh tokens before storing; invalidate on use; detect reuse attacks
- **HTTP-only Cookies**: Set `httpOnly: true`, `secure: true`, `sameSite: 'strict'`
- **Zod Validation**: Validate and strip all request bodies, query params, and path params
- **Centralized Error Handler**: Never expose stack traces or internal details in production responses
- **RLS (Supabase)**: Row-Level Security policies as a second layer ensuring no cross-user data leakage even if application logic fails

### Frontend

- Store access token in memory (Zustand), never in `localStorage`
- Silent refresh on app load (call `/auth/refresh` to restore session)
- Clear all auth state on logout
- Sanitize any user-generated HTML rendered in the journal (use DOMPurify)

---

## Environment Variables

### Backend (`.env`)

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Supabase / PostgreSQL
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres

# JWT
JWT_ACCESS_SECRET=<64-byte-hex-string>
JWT_REFRESH_SECRET=<64-byte-hex-string>
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_REMEMBER_ME_EXPIRES_IN=30d

# Email
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<api-key>
EMAIL_FROM=noreply@yourdomain.com
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Deliverables

Generate all of the following:

1. **Full folder structure** for both `frontend/` and `backend/` with file-level detail
2. **Prisma schema** (`schema.prisma`) with all models, relations, indexes, and enums
3. **Supabase RLS policies** for all tables (SQL)
4. **Prisma migrations** initial migration file
5. **Backend architecture** — app.ts, server.ts, all middleware, all modules
6. **Frontend architecture** — all feature modules, shared components, stores, hooks
7. **All API routes** with full controller and service implementations per module
8. **Authentication flow** — complete end-to-end implementation (signup → email verify → login → refresh → logout)
9. **State management** — Zustand stores and TanStack Query key factory
10. **Reusable component library** — all shared components with TypeScript props
11. **Theme engine** — all 11 theme variable definitions and the ThemeProvider component
12. **Environment variable setup** — both `.env` files and Zod-based validation in `config/env.ts`
13. **Database relationships diagram** — ASCII or Mermaid ERD
14. **API request/response type definitions** — shared TypeScript types for all endpoints
15. **Step-by-step implementation roadmap** — ordered phases from project init to production-ready

---

## Implementation Roadmap

Build in the following phases. Do not skip phases or merge steps prematurely.

### Phase 1 — Project Initialization

- Initialize `backend/` with Node + Express + TypeScript + Prisma
- Initialize `frontend/` with Vite + React + TypeScript + TailwindCSS
- Configure ESLint, Prettier, and TypeScript strict mode for both
- Set up environment variable validation with Zod on the backend
- Connect Prisma to Supabase PostgreSQL, run initial migration

### Phase 2 — Database Schema & Migrations

- Write complete Prisma schema with all models
- Generate and apply initial Prisma migration
- Write Supabase RLS policy SQL for all tables
- Seed database with built-in breathing techniques and default drink templates

### Phase 3 — Authentication Backend

- Implement all auth routes: register, verify-email, login, logout, refresh, forgot-password, reset-password, change-password
- Implement refresh token rotation with database persistence
- Implement session tracking table
- Write auth middleware for protected routes

### Phase 4 — Core Feature APIs

- Implement all CRUD routes and services for: Habits + HabitLogs, Mood, Sleep, Hydration, Journal, Breathing, Goals
- Implement Analytics aggregation queries
- Implement Calendar summary endpoint

### Phase 5 — Frontend Foundation

- Implement design token system and all 11 theme CSS definitions
- Implement ThemeProvider with live switching
- Build AppShell: Sidebar, Topbar, mobile bottom nav
- Build all shared feedback components: Skeleton, EmptyState, ErrorState
- Configure Axios client with token interceptors
- Set up TanStack Query with queryKeys factory
- Set up Zustand stores

### Phase 6 — Authentication Frontend

- Build Login, Register, Verify Email, Forgot Password, Reset Password pages
- Implement silent refresh on app load
- Implement protected route guard

### Phase 7 — Feature Pages

Build all feature pages in order, one module at a time:

1. Dashboard (widgets, layout, drag-and-drop)
2. Habits (list, create, edit, log, streaks)
3. Mood (log, history, calendar)
4. Sleep (log, history, analytics)
5. Hydration (log, templates, progress)
6. Breathing (technique selector, session player, history)
7. Journal (rich text editor, search, tags)
8. Goals (create, milestones, progress)
9. Analytics (charts per module, overview)
10. Calendar (monthly view, day summary)
11. Exports (download flows for all formats)

### Phase 8 — Settings & Personalization

- Build Settings page with: Profile, Appearance (theme, font, density), Dashboard Layout, Notifications, Security (sessions, change password)
- Implement preference sync to database on every change
- Implement preference load on app init (before first render)

### Phase 9 — Polish & QA

- Add all empty states, error states, and skeleton loaders across all views
- Audit all animations for performance and reduced-motion compliance
- Audit keyboard navigation across all interactive elements
- Verify mobile layouts at 320px, 375px, 768px breakpoints
- Audit all API error responses for consistency
- Confirm RLS policies are active and tested

---

*Build everything from first principles as a production-grade application. Every module must be fully implemented — no placeholder functions, no TODO comments, no stubbed responses.*
