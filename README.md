# WordWave

A Duolingo-style language learning app. Courses, progress, and the spaced-repetition schedule live in one SQLite file; accounts are email + password, with optional Google sign-in and throwaway guest sessions.

Live at https://scottmacscott.com (see `DEPLOY.md`). Also listed on the MacScott showcase (`macscott.json`).

Ships with two courses for English speakers (counts from the seed):

| Course | Sections | Units | Lessons | Exercises | Words |
| --- | --- | --- | --- | --- | --- |
| Spanish (3 levels) | 30 | 246 | 738 | 3,444 | 979 |
| Latin (level 1) | 10 | 86 | 258 | 1,204 | 311 |

## Stack

- **Next.js** (App Router) + **TypeScript**
- **SQLite** via **Prisma 7** (better-sqlite3 driver adapter), file at `prisma/dev.db`
- **Tailwind CSS 4** + **shadcn/ui**
- **Zustand** for client-side gamification state

## Getting started

```bash
npm install
npm run db:migrate   # creates prisma/dev.db
npm run db:seed      # loads the Spanish + Latin courses (idempotent)
npm run dev
```

Open http://localhost:3000 — you land on the learn path.

## Features

- **Progression path** — a linear curriculum of units and lessons; finishing a lesson unlocks the next.
- **Exercise engine** — multiple choice, tap-to-build translation, pair matching, and typed fill-in-the-blank. Missed cards re-queue to the end of the session, Duolingo-style.
- **Gamification** — XP per session, a daily streak, quests, achievements, and a shop; the server is authoritative for all of it.
- **Accounts** — email + password (changeable from the profile page), optional Google OAuth, and guest sessions that are deleted on logout. There is no self-serve password reset yet.
- **Spaced repetition** — words you miss get an SM-2-lite review schedule (`src/lib/srs.ts`). Correct reviews stretch the interval by the ease factor; misses reset it to hours and lower the ease. Due words surface under **Review**.

## Architecture

- `prisma/schema.prisma` — User, Session, QuestProgress, Achievement, Course, Section, Unit, Lesson, Challenge, Word, LessonProgress, WordReview
- `src/app/api/*` — route handlers; the server is authoritative for XP, streaks, and SRS state
- `src/components/quiz/*` — the exercise engine (`quiz.tsx` orchestrates; one component per exercise type)
- `src/lib/` — Prisma client, SRS algorithm, gamification rules, zod schemas for exercise payloads, Zustand store
- `prisma/course-data*.ts` — course content, assembled by `prisma/course-build.ts`; edit a level file and re-run `npm run db:seed` to change the curriculum (`npm run db:audit` checks it)
- `scripts/backup-db.mjs` — verified SQLite backups for cron (`npm run db:backup`; DEPLOY.md §7)

## Verification

```bash
npm run typecheck
npm run lint
npm run build
npm run e2e   # drives the real UI with Playwright against a dev server on :3000 (override with E2E_BASE)
```

The e2e script completes your current active lesson with a deliberate mistake, then asserts XP/streak changed, a review was scheduled, and a review session pays out XP. Note: it advances your real progress and review schedule.
