# LingoDuo

A local-first language learning app inspired by Duolingo. Everything runs on your machine: the course, your progress, and the spaced-repetition schedule live in a local SQLite file — no accounts, no network.

Ships with a small **Spanish for English speakers** course: 2 units, 8 lessons, ~50 exercises.

## Stack

- **Next.js** (App Router) + **TypeScript**
- **SQLite** via **Prisma 7** (better-sqlite3 driver adapter), file at `prisma/dev.db`
- **Tailwind CSS 4** + **shadcn/ui**
- **Zustand** for client-side gamification state

## Getting started

```bash
npm install
npm run db:migrate   # creates prisma/dev.db
npm run db:seed      # loads the sample Spanish course (idempotent)
npm run dev
```

Open http://localhost:3000 — you land on the learn path.

## Features

- **Progression path** — a linear curriculum of units and lessons; finishing a lesson unlocks the next.
- **Exercise engine** — multiple choice, tap-to-build translation, and pair matching. Missed cards re-queue to the end of the session, Duolingo-style.
- **Gamification** — XP per session and a daily streak.
- **Spaced repetition** — words you miss get an SM-2-lite review schedule (`src/lib/srs.ts`). Correct reviews stretch the interval by the ease factor; misses reset it to hours and lower the ease. Due words surface under **Review**.

## Architecture

- `prisma/schema.prisma` — User, Unit, Lesson, Challenge, Word, LessonProgress, WordReview
- `src/app/api/*` — route handlers; the server is authoritative for XP, streaks, and SRS state
- `src/components/quiz/*` — the exercise engine (`quiz.tsx` orchestrates; one component per exercise type)
- `src/lib/` — Prisma client, SRS algorithm, gamification rules, zod schemas for exercise payloads, Zustand store
- `prisma/seed.ts` — course content; edit it and re-run `npm run db:seed` to change the curriculum

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm run e2e   # drives the real UI with Playwright against a dev server on :3000 (override with E2E_BASE)
```

The e2e script completes your current active lesson with a deliberate mistake, then asserts XP/streak changed, a review was scheduled, and a review session pays out XP. Note: it advances your real progress and review schedule.
