# Thryve

Bay Area yoga teacher and wellness booking marketplace — Replit pnpm monorepo hosting the Vite+React frontend port and Express API server.

## Run & Operate

- `pnpm --filter @workspace/thryve run dev` — run the frontend (port 24986, preview path `/`)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required secret: `RAPIDAPI_KEY` — RapidAPI key for JSearch job listings

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React, Tailwind CSS v4, wouter routing
- API: Express 5 (port 8080)
- Auth: demo localStorage auth (no real DB in Replit)
- Job search: JSearch API via RapidAPI, proxied through Express

## Where things live

- `artifacts/thryve/src/pages/` — page components (home, teachers, teacher-profile, sign-in, sign-up)
- `artifacts/thryve/src/components/` — shared UI components including `linkedin-job-search.tsx`
- `artifacts/thryve/src/lib/mock-data.ts` — all demo teacher/event/job data
- `artifacts/thryve/src/lib/auth-context.tsx` — localStorage-based demo auth
- `artifacts/api-server/src/routes/jobs.ts` — JSearch proxy route
- `.migration-backup/` — original Next.js source for Vercel deployment
- `.migration-backup/components/job-search.tsx` — Next.js version of job search component
- `.migration-backup/app/api/jobs/search/route.ts` — Next.js API route for JSearch

## Architecture decisions

- **Frontend-only demo**: Auth and data are mocked in localStorage/`mock-data.ts` — no real DB needed for Replit preview
- **API key stays server-side**: `RAPIDAPI_KEY` is only read by the Express server; Vite proxies `/api` to port 8080 in dev so the key never reaches the browser bundle
- **Wouter over React Router**: lighter weight, no loader/action patterns needed for a frontend port
- **Tailwind v4 via @tailwindcss/vite**: replaces the Next.js PostCSS setup; no `tailwind.config.js` needed
- **Job search teacher-only**: `user?.role === "teacher"` gate — students and guests never see the section

## Product

- Browse and search certified yoga teachers across the Bay Area with filters (style, city, certification, gender, delivery mode)
- Teacher profile pages with badges, certifications, bio, offerings, social links, and upcoming events
- Featured teacher carousel, events carousel, and local gigs section on the homepage
- Job Search section (teachers only): live listings from JSearch API with keyword + location search

## User preferences

- Job search section visible only to `role === "teacher"` users, not students
- Apply button on job cards says "Apply Now" (not "Apply on LinkedIn") — JSearch aggregates multiple sources
- Section header uses briefcase icon in `bg-[#FFEAE1] text-[#E37E62]` matching "New Jobs of the Week" style

## Gotchas

- The Vite proxy (`/api → localhost:8080`) only works in dev mode — in production the Express server must be running separately or the API route must be handled differently
- `RAPIDAPI_KEY` must be a Replit Secret (not an env var) so it's available to the Express process
- Demo auth: `teacher@yoga.local / password123`, `student@yoga.local / password123`
- The original Next.js project is preserved in `.migration-backup/` — do not delete it

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- Original Next.js README: `README.md` (root)
- Vercel deployment uses `.migration-backup/` source, not `artifacts/thryve/`
