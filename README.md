# Thryve

Web-only yoga teacher marketplace MVP built with Next.js App Router.

## Included in this app

- Public teacher discovery with booking filters for category, style, session length, certification, gender, delivery mode, city, and available date
- Teacher profile pages with stories, badges, rates, training background, teaching hours, and availability
- Student sign-up, sign-in, credit wallet, booking, and booking history flows
- Teacher dashboard for profile editing, stories, offerings, availability, bookings, and earnings
- Admin views for teachers, bookings, and manual payout tracking
- PostgreSQL-ready Prisma schema matching the marketplace data model
- Demo in-memory data layer so the app runs before a real database is connected

## Stack

- Next.js 16
- TypeScript
- Tailwind CSS 4
- Prisma targeting PostgreSQL
- Stripe-ready credit checkout with demo fallback when keys are missing

## Demo accounts

- `student@yoga.local` / `password123`
- `teacher@yoga.local` / `password123`
- `admin@yoga.local` / `password123`

## Local development

### 1. Install dependencies
```bash
npm install
cp .env.example .env.local
```

### 2. Start PostgreSQL
```bash
docker-compose up -d
```

### 3. Initialize database
```bash
npm run db:push
```

### 4. Start dev server
```bash
npm run dev
```

The app will be available at `http://localhost:3000`. The database schema includes demo data fallbacks, so you can test all features immediately.

### Stopping PostgreSQL
```bash
docker-compose down
```

## Database setup

The app includes a PostgreSQL Prisma schema in `prisma/schema.prisma`. `DATABASE_URL` must be set in `.env.local` (already configured in `.env.example`).

To use a hosted database instead of Docker:
- Update `DATABASE_URL` in `.env.local` with your database connection string
- Run `npm run db:push` to initialize the schema

## Instagram sync

Recent Instagram media can be synced into teacher content. Non-event posts publish as Practice in motion stories, while captions that look like events publish into Newly Added Events.

Set `CRON_SECRET` for the protected cron route. Each instructor manages their own Instagram user ID and access token from the teacher profile dashboard. The scheduled Vercel job calls `/api/cron/sync-instagram` daily and syncs every instructor with saved credentials.

`INSTAGRAM_SYNC_ACCOUNTS` and `INSTAGRAM_ACCESS_TOKEN` are still supported as optional fallback configuration, but they are not required when instructors save credentials in the UI.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

## Demo data

The app includes a hybrid data layer that blends real database data with demo data. When you query for teachers, events, or other data, the results include both actual database records and demo entries from `lib/mock-data.ts`. This allows you to test the full product experience immediately without seeding production data.
