# Changelog

All notable changes to Thryve are documented here.

---

## [Unreleased]

---

## [0.3.0] — 2026-06-11

### Added

- **Job Search section** — live yoga teacher job listings powered by JSearch API via RapidAPI
  - Search by keywords and location with instant re-fetch on submit
  - Job cards show company logo, employment type badge, location, posted date, description snippet, skill tags, and direct "Apply Now" link
  - Skeleton loading state while results are fetched
  - Teacher-only: section is hidden for students and unauthenticated visitors (`role === "teacher"` gate)
- **Next.js API route** — `app/api/jobs/search/route.ts` proxies JSearch server-side with 1-hour Vercel edge cache (`next: { revalidate: 3600 }`)
- **Express API route** — `artifacts/api-server/src/routes/jobs.ts` provides the same proxy for the Replit preview environment
- `README.md` — comprehensive project documentation covering both the Next.js/Vercel and Vite+React/Replit versions, local dev setup, environment variables, and migration notes

### Changed

- Section header uses briefcase icon in warm orange (`bg-[#FFEAE1] text-[#E37E62]`) matching the existing "New Jobs of the Week" palette
- Apply button label is "Apply Now" (JSearch aggregates multiple job sources, not LinkedIn exclusively)

---

## [0.2.0] — 2026-06-11

### Added

- **Replit pnpm monorepo** — full Vite + React port of the Next.js app for Replit preview
  - `artifacts/thryve/` — Vite + React SPA with Tailwind CSS v4
  - `artifacts/api-server/` — Express 5 server that proxies external APIs server-side
- **Pages ported**: Home, Teachers directory, Teacher profile, Sign-in, Sign-up
- **Demo auth** — localStorage-based auth context with seeded `teacher@yoga.local` and `student@yoga.local` accounts (no real database required in Replit)
- **Mock data layer** — all teacher, event, and job data in `artifacts/thryve/src/lib/mock-data.ts`
- **Featured carousels** — featured teachers, upcoming events, and local gigs carousels on homepage
- **Teacher profile pages** — badges, certifications, bio, offerings, social links, and upcoming events
- **wouter routing** — lightweight client-side router replacing Next.js file-based router

### Architecture

- API key (`RAPIDAPI_KEY`) stays server-side — Vite proxies `/api` to Express in dev so the key never reaches the browser bundle
- Tailwind v4 via `@tailwindcss/vite` — no `tailwind.config.js` required
- Original Next.js project preserved in `.migration-backup/` for Vercel deployment

---

## [0.1.0] — Initial release

### Added

- **Teacher discovery** — browse and filter certified yoga teachers by style, city, certification, gender, delivery mode, and available date
- **Teacher profiles** — stories, badges, rates, training background, teaching hours, and availability calendar
- **Student flows** — sign-up, sign-in, credit wallet, booking, and booking history
- **Teacher dashboard** — profile editing, stories, offerings, availability, bookings, and earnings overview
- **Admin views** — teacher list, booking list, and manual payout tracking
- **Instagram sync** — cron route (`/api/cron/sync-instagram`) syncs teacher Instagram posts into stories and events daily
- **PostgreSQL + Prisma schema** — full marketplace data model (teachers, students, bookings, payments, payouts)
- **Demo data layer** — in-memory fallback data so the app runs without a seeded database
- **Stripe-ready checkout** — credit purchase flow with demo fallback when Stripe keys are absent
