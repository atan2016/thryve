# Thryve

Bay Area yoga teacher and wellness booking marketplace. Connects students with certified yoga teachers and wellness practitioners across the San Francisco Bay Area.

---

## What's in this repo

This repository contains two versions of the app:

| Path | Description |
|---|---|
| `.migration-backup/` | Original Next.js + Vercel app (source of truth for Vercel deployment) |
| `artifacts/thryve/` | Replit-hosted Vite + React SPA (frontend port for Replit preview) |
| `artifacts/api-server/` | Express API server (Replit only — serves `/api/jobs/search`) |

---

## Original app (Next.js / Vercel)

Source lives in `.migration-backup/`. Deploy this to Vercel.

### Features

- Public teacher discovery with filters for category, style, session length, certification, gender, delivery mode, city, and available date
- Teacher profile pages with stories, badges, rates, training background, teaching hours, and availability
- Student sign-up, sign-in, credit wallet, booking, and booking history flows
- Teacher dashboard for profile editing, stories, offerings, availability, bookings, and earnings
- Admin views for teachers, bookings, and manual payout tracking
- **Job Search section** — live yoga teacher job listings via JSearch API, visible to signed-in teachers only (added during Replit migration)
- PostgreSQL-ready Prisma schema matching the marketplace data model
- Demo in-memory data layer so the app runs before a real database is connected

### Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Prisma targeting PostgreSQL
- Stripe-ready credit checkout with demo fallback when keys are missing

### Demo accounts

- `student@yoga.local` / `password123`
- `teacher@yoga.local` / `password123`
- `admin@yoga.local` / `password123`

### Local development

```bash
# 1. Install dependencies
npm install
cp .env.example .env.local

# 2. Start PostgreSQL
docker-compose up -d

# 3. Initialize database
npm run db:push

# 4. Start dev server
npm run dev
```

App runs at `http://localhost:3000`. Demo data fallbacks are built in — no seeding required.

```bash
# Stop PostgreSQL
docker-compose down
```

### Environment variables (Vercel)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | JWT signing secret for session cookies |
| `RAPIDAPI_KEY` | Yes | RapidAPI key for JSearch job listings (get free key at rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) |
| `CRON_SECRET` | For cron | Bearer token for `/api/cron/sync-instagram` |
| `STRIPE_SECRET_KEY` | For payments | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | For payments | Stripe publishable key |

### Database setup

Schema lives in `prisma/schema.prisma`. `DATABASE_URL` must be set in `.env.local`.

To use a hosted database instead of Docker:

```bash
# Update DATABASE_URL in .env.local, then:
npm run db:push
```

### Instagram sync

Recent Instagram media syncs into teacher content. Non-event posts publish as "Practice in motion" stories; captions that look like events publish into "Newly Added Events".

Set `CRON_SECRET` for the protected cron route. Each instructor manages their own Instagram credentials from the teacher profile dashboard. The Vercel scheduled job calls `/api/cron/sync-instagram` daily.

### Verification

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Replit app (Vite + React)

Source lives in `artifacts/thryve/` and `artifacts/api-server/`. This is a frontend port for the Replit preview environment.

### Differences from the Next.js version

| | Next.js (Vercel) | Vite + React (Replit) |
|---|---|---|
| Rendering | SSR / App Router | Client-side SPA |
| Auth | JWT sessions, real DB | Demo localStorage auth |
| Database | PostgreSQL + Prisma | Mock data in `mock-data.ts` |
| API | Next.js route handlers | Express (port 8080) |
| Routing | Next.js file router | wouter |

### Running in Replit

```bash
# Frontend (port 24986)
pnpm --filter @workspace/thryve run dev

# API server (port 8080)
pnpm --filter @workspace/api-server run dev
```

### Environment variables (Replit)

| Variable | Required | Description |
|---|---|---|
| `RAPIDAPI_KEY` | Yes | RapidAPI key for JSearch — store as a Replit Secret |

---

## Changes added during Replit migration

These features were built during the Replit migration and have been back-ported to `.migration-backup/` for Vercel deployment.

### Job Search section (`components/job-search.tsx`)

- Live yoga teacher job listings powered by [JSearch API](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) via RapidAPI
- Only visible to signed-in users with `role === "teacher"`
- Search form with keywords + location, results re-fetch on submit
- Job cards show company logo (when available), employment type badge, location, posted date, description snippet, skill tags, and an "Apply Now" link
- **Vercel**: API key proxied server-side via `app/api/jobs/search/route.ts` (1-hour cache via `next: { revalidate: 3600 }`)
- **Replit**: API key proxied via Express at `artifacts/api-server/src/routes/jobs.ts`
