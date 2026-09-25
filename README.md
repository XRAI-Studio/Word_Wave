# WordWave

A Duolingo-style language learning app, and a Travel Schooling class (game slug
`wordwave`). Learners sign in with their school account at
`class.travelschooling.com`; lessons and reviews earn XP on the school's shared ledger.
Courses, lesson progress and the spaced-repetition schedule live in Postgres, in schema
`wordwave` of the portal's Supabase project.

Live at https://wordwave.travelschooling.com (the old address, scottmacscott.com,
redirects there). Also listed on the MacScott showcase (`macscott.json`).

Ships with two courses for English speakers (counts from the seed):

| Course | Sections | Units | Lessons | Exercises | Words |
| --- | --- | --- | --- | --- | --- |
| Spanish (3 levels) | 30 | 246 | 738 | 3,444 | 979 |
| Latin (level 1) | 10 | 86 | 258 | 1,204 | 311 |

## Stack

- **Next.js** (App Router) + **TypeScript**
- **Postgres** via **Prisma 7** (node-postgres driver adapter), schema `wordwave`
- **Tailwind CSS 4** + **shadcn/ui**
- **Zustand** for the HUD totals
- The portal's game kit (`src/lib/kit.ts`, canonical copy from Factors) for identity, totals
  and the sign-in screens

## Getting started

```bash
npm install
cp .env.example .env    # then fill in the local values below
npm run db:dev          # local Postgres 17 on :54329 (leave it running; data in .pgdata/)
npx prisma migrate deploy
npm run db:seed         # loads the Spanish + Latin courses (idempotent, ~4 minutes)
npm run dev
```

Locally `.env` holds `DATABASE_URL` (the URL `npm run db:dev` prints), `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_TS_KIT=mock`. The mock flag gives you a signed-in "Dev Learner", the mock kit
in the browser, and an in-memory mock of the school ledger in the server process, so
nothing reaches the portal. Open http://localhost:3000; a new learner lands on the course
picker.

## Features

- **Progression path**: a linear curriculum of units and lessons; finishing a lesson unlocks the next.
- **Exercise engine**: multiple choice, tap-to-build translation, pair matching, and typed
  fill-in-the-blank. Missed cards re-queue to the end of the session, Duolingo-style.
- **School rewards**: the first completion of a lesson awards `lesson_complete` (10 XP),
  a review session awards `review_session` (10 XP), and the first lesson unlocks
  `wordwave-first-lesson`. The server calls the portal's `award`/`unlock` RPCs with the
  learner's own token after saving progress. Streaks, gems, quests, achievements and the
  shop are the portal's, shared across every class.
- **Launcher tile**: each completion (and a course switch) publishes "n lessons done in
  <course>" to the portal launcher through `save_progress`, with a revision that only
  moves forward.
- **Spaced repetition**: words you miss get an SM-2-lite review schedule (`src/lib/srs.ts`).
  Correct reviews stretch the interval by the ease factor; misses reset it to hours and
  lower the ease. Due words surface under **Review**.

## Architecture

- `src/proxy.ts`, `src/lib/session.ts`, `src/lib/session-cookie.ts`: the page gate and
  session verifier, byte-identical to Word Power's (class standard rule 2.1).
- `src/lib/auth.ts`: `requireUser` / `requireActiveCourse`, which every API route calls
  first; the learner's `User` row is keyed by the portal account id.
- `src/lib/portal.ts`: server-side `award`, `unlock`, `save_progress` calls, and the dev mock.
- `src/lib/progress-service.ts`: lesson and review completion in one transaction each; the
  launcher summary.
- `src/components/kit-provider.tsx`: boots the kit once per page load, with the
  `redirecting` and `kit-failed` screens.
- `src/lib/api-fetch.ts`, `src/lib/pending-submission.ts`: a session that expires
  mid-lesson goes to the portal sign-in and the answers are sent once on return.
- `prisma/course-data*.ts`: course content, assembled by `prisma/course-build.ts`; edit a
  level file and re-run `npm run db:seed` (`npm run db:audit` checks it).

## Verification

```bash
npm run verify   # prisma generate, typecheck, lint, unit tests, Spanish lock, grading check
npm run e2e      # (a) production-mode gate checks; (b) the learner flow on the dev mock
```

The e2e needs the local database running (`npm run db:dev`) and `DATABASE_URL` pointing
at it; it resets the mock learner's rows first and never touches production.

## Deploy

Class standard (`travelschooling-portal/docs/class-standard.md`, rule 4):

1. Locally: `npm run verify` and `npm run e2e`.
2. `.github/workflows/verify.yml` runs `npm run verify` on every push and pull request to
   `master`. It inlines the steps of the portal's shared `class-verify.yml` because this
   repository is public.
3. A push to `master` deploys production (Vercel project `wordwave`). There is no other
   deploy path. The old Hostinger instance at scottmacscott.com still auto-deploys
   `master` too; `next.config.ts` makes it redirect every request to the new host.

Vercel environment (Production):

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | the portal's Supabase URL |
| `SUPABASE_ANON_KEY` | the portal's public anon key (the `apikey` on the ledger calls) |
| `DATABASE_URL` | Supavisor **transaction** pooler, port 6543, user `wordwave_app.<project-ref>` |

`NEXT_PUBLIC_TS_KIT` is never set on Vercel. Each instance opens at most 5 connections
(`POOL_MAX` in `src/lib/db.ts`); the transaction pooler multiplexes them.

Database changes are applied by hand, never at build time:

```bash
# once: the role and schema (as postgres, with the portal's POSTGRES_URL_NON_POOLING)
psql "$POSTGRES_URL_NON_POOLING" -v wordwave_password="..." -f docs/db/wordwave-role.sql
# after a schema change, and after a course-content change
MIGRATE_DATABASE_URL="<session pooler, port 5432, wordwave_app>" npm run db:deploy
MIGRATE_DATABASE_URL="<same>" npm run db:seed
```

Migrations, the seed and `npm run db:audit` all use `MIGRATE_DATABASE_URL` when it is set
and `DATABASE_URL` otherwise (`src/lib/db-url.ts`). The session pooler is used for them
because the direct `db.*.supabase.co` host is IPv6-only. Supabase's backups cover the database.
