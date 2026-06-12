---
name: Thryve Migration Notes
description: Next.js to Vite+React migration decisions and patterns
---

## Key decisions

**Auth:** No real auth backend. Demo users are hardcoded in `src/pages/sign-in.tsx`. Auth state lives in `src/lib/auth-context.tsx` via localStorage (`thryve:auth`).

**Why:** The original used server actions. The Vite port is a frontend-only demo — no auth backend was needed to match the original's look and feel.

**Data:** All teacher/event/badge/offering data lives in `src/lib/mock-data.ts`. No API calls.

**Teacher heart system:** Ported as-is from original — uses `src/lib/teacher-heart-offline-queue.ts` (localStorage-based queue). Heart toggle is optimistic/local only (no server sync).

**Routing:** wouter with `<WouterRouter base={import.meta.env.BASE_URL}>`.

**CSS:** Replaced the scaffold's broken HSL CSS variables with plain Tailwind v4 + Inter font. No ShadCN/Radix styles used (those components still exist in /ui/ but are not the main design system).

**How to apply:** When adding new features, use Tailwind utility classes with the teal/stone/slate palette from the original. Auth context is in `src/lib/auth-context.tsx`. Teacher data in `src/lib/mock-data.ts`.
