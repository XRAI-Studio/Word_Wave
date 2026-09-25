# Class standard, Phase 5 (Word Wave): Postgres, portal login, server-side awards, Vercel

Part of the seven-host rollout approved 2026-09-23 (master plan:
`C:\Users\thetr\.claude\plans\lets-take-a-step-vast-wall.md`; the standard:
`travelschooling-portal/docs/class-standard.md`; the portal design, spec §7.2:
`travelschooling-portal/docs/superpowers/specs/2026-09-07-travelschooling-school-portal-design.md`).
This work order covers the `Word_Wave` repository on `master` (no rename, standard rule
1.3), plus three small edits in `travelschooling-portal` (DNS guard row, standard table,
log). Game slug `wordwave`; hostname `wordwave.travelschooling.com` (DNS already
`A 76.76.21.21`, carried as `pending` in the portal's `scripts/check-dns.mjs`); Vercel
project `wordwave` (to create). Log: `docs/plans/2026-09-25-class-standard-phase5-log.md`.
The repository is **public** (`gh repo view`: `PUBLIC`), so its CI inlines the shared steps
(standard rule 4.2 exception, as for KATAS and Word Forge) and no connection string may
ever be committed.

**Decision recorded 2026-09-25 (the user): start fresh.** Existing Hostinger learners are
not migrated. Spec §7.2's link-by-email step, opening-ledger rows and §11's migration test
are therefore out of scope (see Non-goals); every learner starts at zero on their portal
account. The Hostinger SQLite file is left untouched where it is.

## Goal

Word Wave becomes a class like the others: a Next.js app on Vercel behind the portal's
login, its own data in Postgres (schema `wordwave` of the portal's Supabase project,
reached by a least-privilege role), no accounts or rewards of its own, the school ledger
credited server-side on lesson and review completion with the learner's own token, the
kit in the page for identity, totals and the two standard screens, and
`scottmacscott.com` redirecting to the new host.

## Acceptance criteria (observable)

### Database

1. `prisma/schema.prisma`: `provider = "postgresql"`. Models kept: `Course`, `Section`,
   `Unit`, `Lesson`, `Challenge`, `Word` (unchanged, `meta` stays a JSON string so
   `parseChallenge` is untouched), `LessonProgress`, `WordReview`, and `User` reduced to
   `id String @id` (the portal `sub`, not `@db.Uuid`: the dev mock's `sub` is
   `"mock-user"`), `displayName String?`, `createdAt`, `activeCourseId String?` and the two
   relations. Removed: `Session`, `QuestProgress`, `Achievement`, and `User.email`,
   `passwordHash`, `googleId`, `isGuest`, `xp`, `streakCount`, `lastActiveDate`, `gems`,
   `streakFreezes`, `lessonsCompleted`, `perfectLessons`, `reviewsCompleted`.
2. Migrations: the seven SQLite migrations are deleted (SQLite dialect, not replayable on
   Postgres) and replaced by one generated `init` migration; `migration_lock.toml` says
   `postgresql`. `prisma migrate diff` from the migrations to the schema is empty.
3. Schema isolation: every table lives in schema `wordwave`; `public` gains nothing.
   Runtime and CLI both target `wordwave` (the exact Prisma 7 mechanism, URL `schema`
   parameter or adapter option, is read from `node_modules/prisma` / `@prisma/adapter-pg`
   docs at build time and recorded in the log).
4. Role: `docs/db/wordwave-role.sql` (password as a psql variable, never in the file)
   creates a `LOGIN` role `wordwave_app`, `create schema wordwave authorization
   wordwave_app`, and grants it nothing else. It is run once by hand against production
   with the portal's `POSTGRES_URL_NON_POOLING`. Proof in the log: as `wordwave_app`,
   `select 1 from public.reward_ledger limit 1` and `select 1 from auth.users limit 1`
   fail with `permission denied`; as `anon`/`authenticated` (via `set role`),
   `select 1 from wordwave."User"` fails; `wordwave` is not in the Data API's exposed
   schemas.
5. Connections: runtime `DATABASE_URL` = Supavisor **transaction** pooler (port 6543) as
   `wordwave_app.<project-ref>`; `MIGRATE_DATABASE_URL` = the **session** pooler (port
   5432, same role), used only by `db:deploy` / `db:seed` run by hand from this machine,
   never set on Vercel (the direct `db.*.supabase.co` host is IPv6-only). If the pooler
   rejects the runtime client (prepared statements), the log records it and the fix.
6. Client: `src/lib/db.ts` builds the client with `@prisma/adapter-pg` from `DATABASE_URL`
   through one exported `createDbClient(url)` that `prisma/seed.ts`,
   `scripts/audit-courses.ts` and `scripts/e2e.ts` reuse. Removed from the repo:
   `@prisma/adapter-better-sqlite3`, `bcryptjs`, `src/lib/db-path.ts`,
   `scripts/backup-db.mjs`, `DEPLOY.md`. `prisma.config.ts` reads `MIGRATE_DATABASE_URL`,
   falling back to `DATABASE_URL`, and `prisma generate` succeeds with **neither** set (CI
   and any stray build must not need a database).
7. Scripts: `build` = `prisma generate && next build` (no migrate, no seed at build);
   `db:deploy` = `prisma migrate deploy`; `db:seed` unchanged in behaviour (idempotent
   upserts); `db:dev` = `prisma dev` (local Postgres for development and e2e; production
   is never used for either). Production is migrated and seeded **before** the first
   production deploy; the log records both runs and the row counts (courses, lessons,
   challenges, words).

### Identity

8. `src/proxy.ts`, `src/lib/session.ts`, `src/lib/session-cookie.ts`,
   `tests/proxy.test.ts`, `tests/session.test.ts` are byte-identical to Word Power's
   (`jose` added). The matcher excludes `api/`; API routes answer JSON 401/403 themselves.
9. `src/lib/auth.ts` is rewritten around `verifySession(cookieHeader)`: `requireUser()`
   returns `{ user, token }` after upserting `User { id: sub, displayName }` (display name
   refreshed from the token claim), throws `UnauthorizedError` (401) for missing/invalid
   and `PendingError` (403) for unapproved; `requireActiveCourse()` and
   `courseErrorResponse()` keep their contracts. **Every** API route calls one of the two
   first (rule 2.3); a test lists `src/app/api/**/route.ts` and fails if any file does not
   import from `@/lib/auth`.
10. Server components that used `getSessionUser()` (`(main)/layout.tsx`) use the same
    verifier; on failure they redirect to
    `https://class.travelschooling.com/login?next=<absolute url>` (or `/waiting` when
    pending), never to a local page.
11. Deleted: `src/app/api/auth/**`, `src/app/login`, `src/app/register`,
    `src/components/auth-form.tsx`, `src/components/change-password-form.tsx`, the
    `lingoduo_session` cookie, guest users, Google OAuth and its variables (`APP_URL`,
    `GOOGLE_*`). `src/app/welcome` stays: it is the first-run **course picker**, not an
    auth page; its failure path reloads instead of going to `/login`.

### Rewards

12. Deleted: `src/lib/rewards.ts`, `src/lib/rewards-defs.ts`, `src/lib/gamification.ts`,
    `src/lib/user-service.ts` (streak reconciliation), `src/app/api/quests`,
    `src/app/api/achievements`, `src/app/api/shop/**`, `src/components/quests-card.tsx`.
    `src/app/(main)/awards` is replaced by links to the portal's `/achievements` and
    `/shop`; `profile/page.tsx` loses gems, freezes, the guest banner, password change and
    logout (a "Your school account" link to the portal takes their place).
13. `src/lib/portal.ts`: `createPortalClient({ supabaseUrl, anonKey, fetch })` with
    `award(token, event, detail)`, `unlock(token, id)` and `saveSummary(token, state,
    summary)`. Each POSTs `<NEXT_PUBLIC_SUPABASE_URL>/rest/v1/rpc/{award|unlock|save_progress}`
    with headers `apikey: <SUPABASE_ANON_KEY>`, `Authorization: Bearer <token>`,
    `Content-Type: application/json`, body `{ p_game: "wordwave", p_event, p_detail }` /
    `{ p_achievement }` / `{ p_game, p_state, p_summary, p_rev }`; 5 s timeout; any
    failure (network, non-2xx, timeout) resolves `null` and logs, never throws. The token
    is the same access token `verifySession` accepted (`extractAccessToken`). Never the
    service role. In the session mock mode (`NEXT_PUBLIC_TS_KIT=mock`, not production) a
    per-process in-memory mock replaces it and nothing reaches the network. Unit tests
    cover the three request shapes, the failure-to-null paths and the mock gate.
14. `POST /api/lessons/[lessonId]/complete`: gates and SRS as today. **First completion
    is decided atomically** (WW-P5-001): the route `create`s the `LessonProgress` row
    (`completed: true`); success means this request won the first completion, and a
    unique violation on `(userId, lessonId)` (Prisma `P2002`) means a replay, which only
    refreshes `completedAt` (rows are only ever created completed, so no
    `completed: false` state exists). The transition and the SRS writes commit in one
    transaction before any portal call. Only the winning request calls
    `award(token, "lesson_complete", { lessonId, course: course.code })` and, when that
    succeeded, `unlock(token, "wordwave-first-lesson")` (idempotent on the portal; it
    checks the criteria against the ledger). Replays award nothing. The perfect-lesson
    bonus is gone (the seed has one `lesson_complete` value: 10 XP, 20 a day). e2e fires
    two completions of the same lesson concurrently and asserts exactly one award.
15. `POST /api/review/complete`: SRS as today; when at least one in-course result was
    applied, one `award(token, "review_session", { words: n, course: course.code })` per
    request, not per word (10 XP, 5 a day). Zero results award nothing.
16. Both routes: database writes are committed **before** any portal call, and a portal
    failure leaves them in place. The response carries
    `award: { status: "awarded" | "capped" | "skipped" | "failed", result: KitAwardResult | null }`
    (`skipped` = replay or zero results, no request made; `capped` = the portal answered
    with `awarded_xp` 0; `failed` = the portal call resolved `null`) (WW-P5-005).
17. Launcher summary (WW-P5-003): `User` gains `summaryRev Int @default(0)`. Every
    summary-relevant change (lesson completion, review completion, and a course switch
    through `POST /api/course/active`) publishes a summary: in one transaction the route
    increments `summaryRev` (the row lock orders concurrent requests) and, after the
    increment, reads the snapshot it summarises; then it calls `saveSummary(token,
    { rev: summaryRev }, { headline: "<n> lessons done in <course name>", percent:
    <completed ÷ lessons in the active course, 0–100> })`. Revisions are strictly
    increasing per learner, so a delayed older request loses to the portal's `rev` guard
    and cannot overwrite a newer headline; a unit test on the pure summary function and
    an e2e step (Spanish completion, switch to Latin, stale Spanish summary replayed with
    its older `rev`) cover it. The decision logic (award or not, which event, award
    status, summary text and percent) lives in pure functions with unit tests.
18. Only `lesson_complete` and `review_session` (and the `wordwave-first-lesson` unlock)
    are ever sent: exactly the `wordwave` row and achievement in the portal's
    `supabase/seed.sql` (rule 3.2); a test asserts the event names against a constant
    copied from the seed with its line cited.

### Kit, UI, headers

19. `src/lib/kit.ts` byte-identical to `multiply_factors/src/lib/kit.ts` (rule 3.3). A
    client `KitProvider` in the **root** `src/app/layout.tsx` (WW-P5-002), so it covers
    `welcome`, the `(main)` pages and the two quiz routes outside that group
    (`/lesson/[lessonId]`, `/review/session`) and survives client navigation between
    them. It boots the kit once per page load (`shouldUseMockKit()` ? `loadDevKit` :
    `loadRealKit`, game `"wordwave"`) and renders `redirecting` ("Sending you to sign
    in…", when `kit.user` is null) and `kit-failed` (with a "Try again" control that
    re-runs the boot without a reload) screens (rule 3.4), each with a `data-testid`.
    e2e loads both quiz routes directly (and reloads them) and sees the app, not a blank.
20. HUD totals, one authority per mode (WW-P5-004). Production: the store hydrates XP,
    level, streak and gems from `kit.totals` **once per page load** and afterwards only
    applies `award.result` from completion responses (the kit never made those awards,
    so its totals are stale after the first completion; a full reload fetches fresh
    ones). Dev mock: the server's in-memory mock portal is the only reward state; the
    browser mock kit (`loadDevKit`, unchanged) supplies identity and screens only, and
    the store hydrates from `GET /api/user`'s `devTotals` field, present only when the
    session is the mock. e2e checks the HUD after a completion, after returning to
    `/learn`, and after a reload.
21. Result screen and client auth (WW-P5-005, WW-P5-006). The result screen shows "+10
    XP" for `awarded`, "Daily XP limit reached" for `capped`, "Already completed: no new
    XP" for `skipped` on a replay (nothing for a zero-result review), and "Progress
    saved; XP could not be recorded" for `failed`; each branch has a component test.
    Quests, gems earned, streak-freeze and in-app achievement lists are gone from the UI.
    Every client call to Word Wave's API goes through one `apiFetch` helper: a 401 sends
    the browser to `https://class.travelschooling.com/login?next=<location.href>`, a 403
    to `/waiting`; the lesson and review loaders no longer turn these into "not found" or
    "nothing to review". Before redirecting from a completion, the unfinished submission
    (route and body) is kept in `sessionStorage`; when the same quiz route loads again
    after sign-in it is submitted once and removed, and the result screen shows its
    outcome (the transition in criterion 14 makes a double submission harmless). A unit
    test covers the pending-submission store; e2e forces a 401 on a loaded quiz (the
    mock session honours a `ww-dev-expired` cookie in dev only) and checks the redirect
    target and the resubmission. `/api/user` remains for profile data (display name,
    course, lessons done) and the dev totals.
22. `next.config.ts`: the four standard headers on every response (rule 2.4); a permanent
    redirect for hosts `scottmacscott.com` and `www.scottmacscott.com` to
    `https://wordwave.travelschooling.com/:path*` (config redirects run before the proxy,
    so `src/proxy.ts` stays byte-identical); a unit test covers both.
23. The manifest `<link>` in the served HTML carries `crossorigin="use-credentials"`
    (`/manifest.webmanifest` is gated, Word Forge finding); if Next's metadata cannot emit
    it, the link is written by hand and `src/app/manifest.ts` stays.
24. Nothing but `public/` and app routes is served (rule 2.6): `/PLAN.md`, `/docs/...`,
    `/prisma/schema.prisma` answer 404 live (or the gate's 307, never content).

### Repository

25. `vitest` added; `test` = `vitest run`; `verify` = `prisma generate && npm run
    typecheck && npm run lint && npm test && npm run lock:check && npm run grading:check`.
    `package.json` `name` = `wordwave`. `.env.example` lists every variable with a
    comment and no values: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`,
    `DATABASE_URL`, `MIGRATE_DATABASE_URL`, `NEXT_PUBLIC_TS_KIT` (local only).
26. `.github/workflows/verify.yml`: on push and pull request to `master`, the four steps of
    `class-verify.yml` inlined with a comment naming it (checkout, Node 24 with npm cache,
    `npm ci`, `npm run verify`).
27. `vercel.json` `{ "framework": "nextjs" }`; `macscott.json` `liveUrl` =
    `https://wordwave.travelschooling.com`, `embeddable: false`; README gains a "Deploy"
    section (rule 4.4, plus the by-hand migrate/seed and the role script) and loses the
    login/guest/Google/Hostinger text; `AGENTS.md` gains the class rules (as Factors').
28. `scripts/e2e.ts`, two parts against a local `prisma dev` database:
    (a) production mode (`next build`, `next start`, `NODE_ENV=production`, real
    `NEXT_PUBLIC_SUPABASE_URL`): `/learn` without a cookie → 307 to the portal login with
    `next`; `/api/user` → 401 JSON; a request with `Host: scottmacscott.com` → 308 to the
    new host; the four headers present.
    (b) dev mode with the mock (`NEXT_PUBLIC_TS_KIT=mock`): the picker sets a course;
    `/learn` renders; one lesson completed with one deliberate mistake → `LessonProgress`
    row, a `WordReview` row, `awarded.awarded_xp === 10`; the same lesson again →
    `awarded` absent/zero and no second award; a review session → one `review_session`
    award; the HUD shows the XP. The old "registers a throwaway user" path is gone.

### Live

29. Vercel project `wordwave` in `scottmacscott-8212s-projects`, connected to
    `XRAI-Studio/Word_Wave`, Framework Next.js, Root `.`, Production Branch `master`,
    env (Production) `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_ANON_KEY`, `DATABASE_URL`;
    domain `wordwave.travelschooling.com` with a certificate.
30. After the push: CI `verify` green; `curl -sI https://wordwave.travelschooling.com/`
    → 307 to `https://class.travelschooling.com/login?next=https%3A%2F%2Fwordwave.travelschooling.com%2F`
    with the four headers; `/api/user` → 401; `/_next/static/...` assets 200.
31. `https://scottmacscott.com/` → 308 to the new host (served by the Hostinger instance's
    own auto-deploy of `master`, see Risks); if Hostinger's build does not pick it up
    within 15 minutes, the log says so and the fix becomes a user action.
32. Portal repo: `wordwave` row's `pending` flag removed from `scripts/check-dns.mjs`
    (`npm run dns:check` green, all seven hosts); `docs/class-standard.md` table row
    updated; the rollout summary in its `PLAN-REVIEW-LOG.md`; the user-actions file
    updated. Showcase revalidated after the `macscott.json` change.
33. Signed in (Chrome, if a portal session exists on this machine; otherwise a user
    action): `/learn` loads, one lesson completes, `POST rpc/award` 200 from the server
    (visible as a new `lesson_complete` ledger row), the portal launcher tile shows the
    headline.

## Approach

Order: branch-free on `master` locally, nothing pushed until the database is ready.
(1) Role and schema in production, (2) Prisma to Postgres locally against `prisma dev`,
(3) identity, (4) rewards and portal client, (5) kit/UI, (6) headers/redirect/manifest,
(7) tests, e2e, docs, CI, (8) `db:deploy` + `db:seed` against production as
`wordwave_app`, (9) Vercel project, env, domain (created before the push so the first
production build has its variables), (10) one push to `master`, live checks, portal edits.
Codex inspects after the build, per the rollout's practice.

## Non-goals

- Migrating Hostinger learners (the 2026-09-25 decision; deviation from spec §7.2
  "Existing balances are migrated once" and "links ... by matching email", and from §11's
  migration test). The SQLite file on Hostinger is not touched or deleted.
- Streak freezes, shop, quests and achievements inside Word Wave (the portal owns them).
- Google sign-in, guests, password change (the portal owns accounts).
- Offline play, course content changes, visual redesign.
- Awards from the client: Word Wave never calls `kit.award`; the kit's offline award queue
  is unused here.

## Confirmed assumptions

- The portal's `award(p_game, p_event, p_detail)` and `unlock(p_achievement)` are
  `security definer` and read `auth.uid()` from the bearer token; `save_progress` is
  `security invoker` with the `rev` guard (`0007_progress_revision_guard.sql`).
- Seed: `wordwave` → `{"lesson_complete":{"xp":10,"per_day":20},"review_session":{"xp":10,"per_day":5}}`,
  daily cap 300; achievement `wordwave-first-lesson` with criteria
  `{event: lesson_complete, count: 1}` (`supabase/seed.sql` lines 5 and 47).
- `prisma dev` (v0.16.28) is installed with Prisma 7.8 and serves a local Postgres.
- The seed is idempotent and non-destructive (`prisma/seed.ts` header comment).
- `lock:check` and `grading:check` read course data files only (no database).
- Hostinger's Node app deploys `master` automatically on push (`DEPLOY.md` §1).

## Risks

- **Hostinger auto-deploys `master`.** The push that deploys Vercel also rebuilds the
  Hostinger instance with code that has no database there. The config-level host redirect
  (criterion 22) turns that instance into a redirector, and `prisma generate` / `next
  build` need no database (criterion 6), so its build should succeed. If it fails,
  Hostinger may keep the old build or stop: either way the fix is a user action in hPanel
  (stop the Node app and add a redirect, or disconnect auto-deploy). The old instance's
  learners were going to start fresh anyway; the window is minutes.
- Supavisor transaction mode and prepared statements (criterion 5).
- Seeding ~4,600 challenges over the network is slow (many round trips); it runs once by
  hand; the log records its duration.
- Completion latency gains one to three portal round trips (bounded by the 5 s timeout).
- Public repository: `.env*` is already ignored; the role password exists only in
  Vercel's env and the local `.env`.

## Verification

`npm run verify` and `npm run e2e` green locally; CI green on the push; the live checks
of criteria 30–33; `npm run dns:check` in the portal green; each run and its output
recorded in the log with commit hashes.
