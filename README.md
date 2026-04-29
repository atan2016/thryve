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

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Database setup

The app includes a PostgreSQL Prisma schema in `prisma/schema.prisma`.

When you are ready to connect a real database:

```bash
npm run db:generate
npm run db:push
```

Set `DATABASE_URL` in `.env.local` first.

## Verification

```bash
npm run typecheck
npm run lint
npm run build
```

The current UI uses an in-memory demo store so you can validate the product flows immediately while keeping the production schema ready for later persistence work.
