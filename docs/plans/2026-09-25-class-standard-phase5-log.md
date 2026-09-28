# Phase 5 (Word Wave) log

Work order: `docs/plans/2026-09-25-class-standard-phase5.md`. Roles (claudex-loop, host
Claude Code): Claude plans, coordinates and builds; Codex reviews the plan and inspects the
build in fresh sessions. Reviewer model: the Codex CLI default from
`~/.codex-review-home/config.toml`, `gpt-6-astra` at `model_reasoning_effort = "high"`
(no `-m` pin). Round limits: plan review 5, fix rounds 2, inspections 2. Codex runs in the
foreground (background runs were killed for memory on this machine).

Authorization: the user chose "start fresh" on 2026-09-25 (portal
`docs/user-actions-2026-09-25.md`, commit `3e4024b`) and asked to continue the rollout,
whose approved plan builds each phase after its Codex plan review.

## Plan review

### Round 1 — Codex (REVISE, 1 high, 5 medium)

Runner result: `scratchpad/claudex-runs/claudex-hdl_xsfl/result.json`, session
`01a0da53-919c-71f3-bcef-5d1dde9d3209`, plan SHA256 `bb69a817…9be6`, CLI default model
(`gpt-6-astra` / `high` from the review config; observed model not reported). Usage 598,346
input (517,504 cached), 4,349 output; 194 s.

- **WW-P5-001 (high)** first completion is a read-then-upsert: two concurrent submissions
  both award. *Accepted*: atomic `create` against the unique key, P2002 = replay; one
  transaction before the portal call; concurrent e2e.
- **WW-P5-002** kit provider missed the quiz routes outside `(main)`. *Accepted*: root layout.
- **WW-P5-003** completed-lesson count is not a total order for summaries (course switch,
  equal revs accepted). *Accepted*: `User.summaryRev` incremented with the snapshot in one
  transaction; course switch publishes.
- **WW-P5-004** dev mock totals split between browser and server mocks. *Accepted*: server
  mock authoritative in dev via `devTotals`; production hydrates once per load.
- **WW-P5-005** replay would show a failure/cap message. *Accepted*: award status enum.
- **WW-P5-006** expired token mid-lesson gives a generic error. *Accepted*: `apiFetch`
  redirects, pending submission kept in `sessionStorage` and resubmitted once.

### Round 2 — Codex (REVISE, 2 high, 1 medium)

Result `claudex-runs/claudex-liwv34zn/result.json`, same session, plan SHA256
`cbafd1c1…5474`; usage 580,064 input (544,128 cached), 2,860 output; 113 s. WW-P5-002 to 005
confirmed addressed.

- **WW-P5-001 (high, reopened)** a caught `P2002` aborts the Postgres transaction.
  *Accepted*: `createMany({ skipDuplicates: true })` count, SRS on the transaction client.
- **WW-P5-007 (high)** the pending submission could replay under a different learner.
  *Accepted*: bound to user id and course, discarded on mismatch, server 409 on an
  `X-WordWave-Expect-User` mismatch.
- **WW-P5-008** the unlock's gems were missing from the HUD. *Accepted*: unlock totals win.

### Round 3 — Codex (APPROVED)

Result `claudex-runs/claudex-1e9ep76f/result.json`, same session
`01a0da53-919c-71f3-bcef-5d1dde9d3209`, plan SHA256
`3db1c1381aab37f253324f6fa712010a17b34f4a4dc1cd61871ae61511808647`; usage 420,400 input
(400,640 cached), 905 output; 44 s. "All prior findings are addressed at the plan level ...
No additional material defects identified." Limitations: implementation, production
privileges, pooler compatibility, deployment, DNS and signed-in behaviour unverified.

**Plan review: 3 rounds, approved.** Pre-build commit for inspection: this log commit.

## Build

Builder: Claude (host). Pre-build commit `a70ebfa`.

### Database (criteria 1–7)

- **Portal hardening found on the way (portal `823e37f`).** Probing grants before creating
  the role showed `award`, `unlock`, `buy`, `check_quests` (security definer) and
  `save_progress` still carried Postgres's default EXECUTE-to-PUBLIC: 0003/0005/0007
  granted them to `authenticated` but never revoked PUBLIC, so any database login role
  could set `request.jwt.claims` itself and credit any learner. Migration
  `0008_reward_rpc_grants.sql` revokes PUBLIC and `anon` (authenticated keeps its grant),
  with `tests/sql-rpc-grants.test.ts`; applied with `supabase db push`. Live afterwards:
  `authenticated` still has execute on all five.
- Role (`docs/db/wordwave-role.sql`, run once as `postgres`): Supabase's `postgres` is not
  a superuser and cannot `SET ROLE` to a new role, so `create schema ... authorization
  wordwave_app` was refused; the schema is owned by `postgres` with `usage, create`
  granted to `wordwave_app`, which owns every table its migrations create. Proof, as
  `wordwave_app` through both poolers (6543 and 5432): `search_path` = `wordwave`;
  `public.reward_ledger`, `public.profiles`, `auth.users` denied; `public.award()` and
  `public.unlock()` "permission denied for function"; `create table public.x` denied;
  create/drop in `wordwave` allowed. As `postgres`: `anon` and `authenticated` have no
  usage on `wordwave`. The Data API's exposed schemas are the defaults (no `[api]`
  override in the portal's `supabase/config.toml`), so `wordwave` is not exposed.
- Prisma 7: `prisma.config.ts` takes the CLI URL (`MIGRATE_DATABASE_URL`, else
  `DATABASE_URL`) with `schema=wordwave` added; the runtime adapter takes
  `{ schema: "wordwave" }` (`@prisma/adapter-pg` option). Prisma 7 no longer reads `.env`,
  so the config calls `process.loadEnvFile` (explicit variables win, checked).
  `prisma generate` and `next build` succeed with no database variable (criterion 6).
- **TLS:** node-postgres treats `sslmode=require` as verify-full, and Supabase's pooler
  chains to Supabase's own root, so the first production seed failed with "self-signed
  certificate in certificate chain". Verification is kept, not disabled: the Supabase Root
  2021 CA (SHA-256 `80:70:25:AD:…:CA:FA`, valid to 2031-04-26; fetched with
  `openssl s_client -starttls postgres`, chain leaf `*.pooler.supabase.com` → Intermediate
  2021 → Root 2021) is pinned in `src/lib/supabase-ca.ts`; `connectionConfig` drops the
  URL's `sslmode` for Supabase hosts and passes `ssl: { ca, rejectUnauthorized: true }`
  (`tests/db-config.test.ts`). The Prisma CLI (migrate) was unaffected.
- **Local database (deviation from criterion 7).** `prisma dev` (PGlite underneath) dropped
  connections ("Connection terminated unexpectedly") under the app's parallel queries and
  concurrent transactions: one e2e run passed after capping the pool, the next failed the
  same way on a server that accepted two plain connections. Since the e2e exists partly to
  prove concurrent-completion safety, `db:dev` now starts a real Postgres 17 (production's
  major) from the `embedded-postgres` dev dependency (`scripts/db-dev.ts`, port 54329, data
  in git-ignored `.pgdata/`, initialised `--encoding=UTF8 --no-locale` because Windows
  otherwise picks WIN1252, which cannot store the course emblems). Its packages are
  versioned `-beta` upstream (17.10.0-beta.17); CI's `npm ci` downloads the Linux binary
  although `verify` never opens a database.
- **Pool:** capped at `POOL_MAX = 5` per client (2 for the e2e script's own client);
  `pg`'s default of 10 is more than a Vercel instance behind the transaction pooler needs.
- Migration `20260925210533_init` applied to production through the session pooler as
  `wordwave_app`.

### Build notes and deviations

- Criterion 23: Next's metadata adds `crossorigin="use-credentials"` to the manifest link
  only on Vercel preview builds (`next/dist/lib/metadata/metadata.js`), and a
  `manifest.ts` would also emit its own link. The manifest is therefore a static
  `public/manifest.webmanifest` with a hand-written credentialed link in the root layout,
  and `src/app/manifest.ts` is deleted (the work order said it would stay).
- Criterion 17's e2e step replays a stale Spanish summary with its older `rev`: the e2e
  cannot send a raw `save_progress` through the server, so it checks the ordering
  property instead (revisions strictly increase: 2 → 7 → 8; the switch publishes a newer
  one; the database `summaryRev` equals the published rev; headline follows the switch).
  The rejection of an older rev is covered by the mock's unit test and by the portal's
  SQL guard (`0007`, its own tests).
- Criterion 19: the `kit-failed` screen is not driven by e2e (on localhost the mock kit
  loads from the bundle, not the network); the screen and its retry are the same shape as
  Factors' and Word Power's.
- `/awards` stays as a page of links to the portal's achievements and shop, so the nav is
  unchanged.
- `vercel link` wrote `.env.local` with `VERCEL_OIDC_TOKEN` (git-ignored).
- `applySrsResults` creates new `WordReview` rows with `createMany({ skipDuplicates })`
  too: a concurrent submission of the same lesson could otherwise abort the transaction
  on the `(userId, wordId)` key, which the e2e's concurrent step exercises.

### Proofs (local)

- `npm run verify`: prisma generate, typecheck and lint clean; 12 files / 79 tests
  (proxy, session, next-config byte-identical to Word Power's; host redirect, portal
  client, completion, pending submission, apiFetch, auth, API-route coverage, result
  screen, db config); Spanish lock OK; grading checks passed.
- Byte identity (git blob hashes): `src/proxy.ts`, `src/lib/session.ts`,
  `src/lib/session-cookie.ts`, `tests/{proxy,session,next-config}.test.ts` = Word Power;
  `src/lib/kit.ts` = Factors.
- `npm run e2e` part (a), production build with no database: 26 checks passed (307 to the
  portal login with `next` on five page routes, four headers, `/api/user` JSON 401,
  both old hosts 308 to the new host with path and query, icon 200, manifest gated,
  `/prisma/schema.prisma`, the work order, `/PLAN.md`, `/.env` not served).
- `npm run e2e` part (b), dev mock on the local Postgres 17: 33 checks passed (twice in a row) (course picker,
  credentialed manifest link, first lesson with a mistake → awarded 10 XP, one
  `LessonProgress`, one `WordReview`, HUD 10 XP and 5 gems after returning without a
  reload and 10 XP after a reload, headline "1 lesson done in Spanish", replay skipped
  with no XP, direct load and reload of `/lesson/[id]` and `/review/session`, two
  concurrent completions → one first completion and one award, expected-user mismatch
  409 with no write, review → one 10 XP award, expired session → portal login with the
  lesson as `next`, nothing saved, kept submission sent once on return and awarded, no
  resubmission on reload, summary revisions increase across the Latin switch).

### Production database and deploy

- Production seeded as `wordwave_app` through the session pooler after the TLS fix: 2
  courses, 40 sections, 332 units, 996 lessons, 4,648 challenges, 1,290 words (221 s).
- Runtime probe through the **transaction** pooler (6543) as `wordwave_app` with the
  verified TLS config: counts, repeated same-shape queries, four parallel queries, and an
  interactive transaction with `createMany({ skipDuplicates })` then a deliberate
  rollback (nothing left behind). No prepared-statement errors.
- Vercel project `wordwave` (`prj_IHHLhBoQcofA7ooEQUlFxj5JFBd4`): created, linked,
  git-connected to `XRAI-Studio/Word_Wave`; Framework Preset set to `nextjs` through the
  REST API (the CLI created it as "Other"; the Vercel MCP connection could not see this
  team), Root `.`, Production Branch `master`; env (Production) `NEXT_PUBLIC_SUPABASE_URL`,
  `SUPABASE_ANON_KEY`, `DATABASE_URL` (sensitive); domain `wordwave.travelschooling.com`.
- Pushed `master` at `e90bcac`. Deployment `wordwave-di1gz66yo` Ready in 57 s; CI `verify`
  run 36193432163 success.
- Live (criterion 30): `/`, `/learn`, `/manifest.webmanifest`, `/prisma/schema.prisma`,
  `/PLAN.md` → 307 to `https://class.travelschooling.com/login?next=<url>`; the four
  headers plus Vercel HSTS; `/api/user` → 401 `{"error":"Not signed in"}`;
  `/icon-192.png` 200.
- Old address (criterion 31): Hostinger's auto-deploy rebuilt `master` within minutes;
  `https://scottmacscott.com/`, `/learn` and `https://www.scottmacscott.com/` answer 308 to
  the same path on `https://wordwave.travelschooling.com` (`platform: hostinger`).
- Portal: `wordwave` pending flag removed from `scripts/check-dns.mjs`; `npm run dns:check`
  all seven hosts ok; `tests/dns-guard.test.ts` updated (no pending host; the pending
  mechanism still tested on a table that marks one).

## Inspection 1 — Codex (REVISE, 6 medium, 2 low)

Runner result `claudex-runs/claudex-ge6n5dna/result.json`, fresh session
`01a0da94-4115-7e83-bf57-37e3e46eaf61`, base `a70ebfa`, inspected tree `e90bcac`; CLI
default model (`gpt-6-astra` / `high`); usage 1,603,206 input (1,387,648 cached), 6,546
output; 249 s. All eight accepted; fix round 1:

- **WW-INSPECT-001** the review award counted submitted in-course results, not applied
  ones: a correct answer for an unscheduled word earned XP. *Fixed:* `applySrsResults`
  returns the number of words it scheduled; the route awards on that and reports it in
  `p_detail.words`. Unit test (`tests/review-service.test.ts`) and e2e ("a correct answer
  for an unscheduled word is not a review").
- **WW-INSPECT-002** a failed resend of a kept submission fell into ordinary quiz
  advancement on an empty quiz. *Fixed:* recovery moved out of the quiz into
  `PendingRecovery`; a failed send shows "Couldn't save your answers yet" with Try again,
  which resends the exact payload (kept in state and re-stored for a reload). e2e: a 500
  on the resend, then Try again → awarded and saved.
- **WW-INSPECT-003** recovery ran only if the quiz mounted (no due reviews, or a lesson
  404 after a course switch, meant no send and no discard). *Fixed:* `PendingRecovery`
  wraps both quiz routes and resolves the submission first, against `/api/user`'s new
  `activeCourseCode`. e2e: a kept review is sent with nothing due; a kept Spanish lesson
  is discarded while Latin is active and never replays after switching back.
- **WW-INSPECT-004** SRS read-modify-write could lose a result when two submissions for
  the same learner touched one word. *Fixed:* every completion transaction first takes
  `SELECT ... FOR UPDATE` on the learner's `User` row, so they serialise per learner.
  e2e: a lesson (word correct) and a review (same word wrong) sent concurrently keep the
  miss (lapses + 1). The e2e passing does not prove the race was hit on this run; the
  lock is what guarantees it.
- **WW-INSPECT-005/006/008** the seed and audit used `DATABASE_URL` while migrations used
  `MIGRATE_DATABASE_URL`, an empty template value blocked the fallback, and the audit
  never loaded `.env`. *Fixed:* `src/lib/db-url.ts` (`toolDatabaseUrl`, blank = unset;
  `loadLocalEnv`) shared by `prisma.config.ts`, the seed and the audit
  (`tests/db-url.test.ts`); README "Deploy" updated.
- **WW-INSPECT-007** `.env.example` was git-ignored by `.env*`. *Fixed:* `!.env.example`.

Proofs after the fix round: `npm run verify` 14 files / 87 tests; Spanish lock OK;
grading checks passed. `npm run e2e`: 68 checks passed (26 in part a, 42 in part b).

## Inspection 2 — Codex (REVISE, 3 medium, 1 low)

Runner result `claudex-runs/claudex-0r0rcn2t/result.json`, fresh session
`01a0da9e-01f5-7e13-b059-f5cb9259d2f3`, base `a70ebfa`, inspected tree `dfa0cca`; usage
2,520,105 input (2,307,968 cached), 5,330 output; 218 s. All four accepted. This spends
the default inspection budget (initial plus one after fixes); as on the earlier phases
of this rollout (Factors took eight), fixing continues with a fresh inspection 3.

- **WW-P5-R2-001** a failed resend re-stored the payload, and a successful Try again
  never removed it, so a reload sent it again. *Fixed:* the submission now stays stored
  from the moment it is kept until it is sent successfully (then removed) or discarded;
  recovery reads it with `peekPending` and removes it with `clearPending`.
- **WW-P5-R2-002** a 5xx from `/api/user` made the course code empty and discarded valid
  answers. *Fixed:* a lookup failure keeps the submission and shows the retry; the
  learner and course compared are the server's (`me.id`, `me.activeCourseCode`), not the
  booted kit's.
- **WW-P5-R2-003** a `user-mismatch` 409 was treated as transient and retried forever.
  *Fixed:* `postCompletion` throws `CompletionError(status, code)`; `user-mismatch`
  discards the submission; Try again repeats the whole identity/course check before
  resending.
- **WW-P5-R2-004** the portal handoff still said Phase 5 was blocked and the portal log
  had no Phase 5 summary. *Fixed in portal `e4197ac`* (handoff §4 assigns the signed-in
  lesson, review and launcher check to the user; rollout summary; standard table; DNS
  guard pending flag removed with its tests updated). Portal `npm run verify`: 28 files /
  216 tests.
- Found while fixing: development's StrictMode runs mount effects twice, which (with the
  submission now kept until sent) sent it twice; a once-per-mount ref guard in
  `PendingRecovery` stops that. Production does not double-invoke effects.

Proofs after fix round 2: `npm run verify` 14 files / 86 tests (the pending-submission
suite rewritten for peek/clear/belongsTo); Spanish lock OK; grading checks passed.
`npm run e2e`: 75 checks passed (26 in part a, 49 in part b; new: a retry removes the
kept submission and a reload sends nothing again; a 503 profile lookup keeps it and Try
again sends; a `user-mismatch` 409 discards it and saves nothing).

## Inspection 3 — Codex (REVISE, 2 medium)

Runner result `claudex-runs/claudex-wzdgi8ca/result.json`, fresh session
`01a0daaa-d400-7e81-acb6-f9a827e8d97a`, base `a70ebfa`, inspected tree `f896055`; usage
2,806,026 input (2,565,888 cached), 7,122 output; 289 s. Both accepted; fix round 3:

- **WW-P5-R3-001** a submission whose first send committed but whose response was lost
  (or a reload mid-send) was applied again: SRS twice and a second `review_session`
  award. *Fixed:* every quiz carries a `submissionId` (a UUID created once per quiz in the
  browser, kept across retries and the sign-in round trip; required by both routes).
  New table `Submission (userId, id)` with the recorded award outcome (migration
  `20260925222918_submission_ids`, applied to production before the code shipped). Inside
  the completion transaction, after the learner lock, the id is claimed with
  `createMany({ skipDuplicates })`; a repeat writes nothing, awards nothing, and returns
  `{ duplicate: true, award: <recorded outcome or skipped> }`. e2e: the same review sent
  twice changes the schedule once and awards once; a kept review whose first send
  reached the server but lost its response shows the recorded outcome on Try again, with
  lapses and XP moved once.
- **WW-P5-R3-002** an account switch in another tab left the open page on the old
  identity; ordinary quiz submissions got 409 `user-mismatch` forever. *Fixed:* a
  `user-mismatch` in the quiz reloads the page under the new identity and drops the old
  learner's answers (`src/lib/account-change.ts`), with a notice after the reload; the
  kit provider also re-checks `/api/user` when the tab regains focus or visibility and
  reloads if the learner differs. e2e: both paths (409 during a quiz; focus after a
  different learner is reported).

Proofs after fix round 3: `npm run verify` 14 files / 86 tests; Spanish lock OK; grading
checks passed. `npm run e2e`: 87 checks passed (26 in part a, 61 in part b).

## Inspection 4 — Codex (REVISE, 2 medium)

Runner result `claudex-runs/claudex-tcna_3lc/result.json`, fresh session
`01a0dab4-340e-7c50-81fd-d07d60b4fe43`, base `a70ebfa`, inspected tree `ce17974`; usage
1,670,621 input (1,452,416 cached), 4,827 output; 196 s. Both accepted; fix round 4:

- **WW-P5-R4-001** a repeat arriving while the first send's portal call was still in
  flight found no recorded outcome and was answered as a final "skipped". *Fixed:* such
  a repeat answers **202** `{ duplicate, pending }`; `postCompletion` asks again every
  1.5 s (up to 8 times, then a retryable failure that keeps the submission). A claim
  still without an outcome after 60 s (`ABANDONED_AFTER_MS`; the portal call times out at
  5 s) is taken as abandoned and finalised as `failed`, never re-awarded (the award RPC
  is not idempotent). The review route now records its outcome in every case, `skipped`
  included, so a finished review never looks unfinished. e2e: a pre-claimed submission
  answers 202; a page recovering it shows "Saving your answers" and then the outcome
  once it is recorded; a claim two minutes old reports `failed` and awards nothing.
- **WW-P5-R4-002** a repeat's historical totals overwrote the HUD. *Fixed:* duplicate
  responses never reach `applyAward` (quiz or recovery); the result screen's gems and
  streak come from the HUD store, its XP-earned from the award. e2e: lost response, an
  award in between, reload mid-recovery → the recorded outcome shows and the HUD stays
  at the current total.

Proofs after fix round 4: `npm run verify` 14 files / 86 tests; Spanish lock OK; grading
checks passed. `npm run e2e`: 93 checks passed (26 in part a, 67 in part b).

## Inspection 5 — blocked (Codex login)

Two attempts (`claudex-runs/claudex-nb6n3qpk`, `claudex-emni1xfn`) failed in about 33 s
with `401 Unauthorized: Incorrect API key provided` from `chatgpt.com/backend-api/codex`.
The main Codex home fails the same way on a one-word prompt, so this is the account's
Codex sign-in, not the review home (its previous `auth.json` is backed up as
`auth.json.bak-20260925184309`). **Inspection of fix round 4 (`34b46c5`) is outstanding**
until the user runs `codex login` again; then a fresh inspection with base `a70ebfa`.

State at this point: `34b46c5` deployed (Ready) and CI green on every push; production
database migrated to `20260925222918_submission_ids`; live gate, API 401 and the
scottmacscott.com redirect unchanged. Round accounting so far: plan review 3 rounds
(approved), fix rounds 4, inspections 4 completed (all REVISE, every finding fixed) plus
1 blocked.

## Inspection 5 (after the Codex login) — Codex (REVISE, 3 medium)

Runner result `claudex-runs/claudex-_goup9fi/result.json` (scratchpad of session
`d4ddff9e`), fresh session `01a0e964-fa96-7b43-93bd-fa4446a6600c`, base `a70ebfa`,
inspected tree `8cb5d1d` (fix round 4 + its log, in a detached worktree; the later Home
Room commits `01076b9`..`ce4bcb2` were inspected in their own loop, portal
`PLAN-REVIEW-LOG.md`). CLI `codex-cli 0.153.4`, requested model: CLI default
(`gpt-6-astra` / `high`), observed model: not reported. Usage 2,169,594 input (1,940,864
cached), 6,278 output; 248 s. Checked against `master` `ce4bcb2`: all three still apply.

- **WW-P5-R5-001** (`quiz.tsx`, `pending-recovery.tsx`) a `duplicate` response leaves the
  HUD's XP, gems and streak at their pre-completion values (the kit hydrates only at boot),
  e.g. a same-page retry after a lost response, or recovery that polls an award still
  finishing. The server's totals are right; the HUD is stale until a reload.
- **WW-P5-R5-002** (`pending-recovery.tsx:53`) when `/api/user` reports a different
  learner than the booted kit, recovery discards the old submission and renders the new
  learner's quiz under the old kit identity; finishing it gets `user-mismatch` and the
  new answers are dropped by the reload. Same after a `user-mismatch` from the resend.
- **WW-P5-R5-003** (`submit-completion.ts:38`) an ordinary finished quiz is kept in
  sessionStorage only on a 401/403 redirect; during the first POST, a network failure or
  202 polling it lives only in memory, so a reload (past the leave prompt) loses the
  answers and the submissionId that would recover the server's outcome.

Disposition: the user chose to fix all three, then one Codex re-check limited to them.

## Fix round 5 (inspection 5)

All three accepted and fixed on `master` (after the Home Room commits):

- **WW-P5-R5-001** *Fixed:* `PortalClient.currentTotals` reads `reward_totals` with the
  learner's token (the kit's own read; RLS "own totals"), the mock answers from memory.
  Both completion routes return `totals` with a repeat (null when the portal did not
  answer). `hudTotalsAfter` picks a first send's award totals or a repeat's current
  totals, never a repeat's historical award; the quiz and recovery hydrate the HUD from
  it (`applyAward` removed from the store). Unit tests (`tests/portal.test.ts`,
  `tests/submit-completion.test.ts`); e2e "the HUD shows the current totals after a
  repeat" (a lost response, Continue on the same page, back to the path, no reload).
- **WW-P5-R5-002** *Fixed:* recovery compares the server's learner with the kit's; if they
  differ it discards the submission when it is not the server learner's and reloads
  through `reloadForAccountChange` before any quiz renders. A `user-mismatch` from the
  resend now discards and reloads too. e2e: the second `/api/user` answers another learner
  → notice, submission gone, nothing saved.
- **WW-P5-R5-003** *Fixed:* the quiz stores the submission before the first POST, clears
  it on a success or a `user-mismatch` (then reloads), and keeps it through a failure or
  polling, so a reload lets `PendingRecovery` resend it under the same submission id.
  e2e: a lost response keeps it; a reload shows the recorded outcome with no second award.

Proof: `npm run verify` PASS (19 files / 159 tests, lock and grading checks); `npm run e2e`
ALL E2E CHECKS PASSED (154 checks).

## Targeted re-check of fix round 5 — Codex (REVISE, 2 medium regressions)

Runner result `claudex-runs/claudex-0qb_8e6n/result.json`, fresh session
`01a0e974-9c7b-77d1-9bda-72daad8530eb`, base `718ccf6`, tree `1a119dc`, scope limited by a
host brief to the three findings and what the fix touches; CLI default (`gpt-6-astra` /
`high`); usage 1,142,720 input (1,015,808 cached), 3,871 output; 170 s. "The three
reported scenarios are addressed" (R5-001..003 closed), but keeping every completion
introduced two lifecycle defects, both accepted:

- **WW-P5-R6-001** the single sessionStorage key: a later quiz's keep-then-clear erased
  another route's kept submission (e.g. a failed recovery of A, then B completes).
  *Fixed:* `keepPending` never overwrites a different quiz's submission (route +
  submissionId); `clearPendingFor` clears only the same quiz. The quiz uses both.
- **WW-P5-R6-002** "Leave without saving" after a failed send left the kept copy, so a
  later visit sent the answers the dialog said were lost. *Fixed:* `UnsavedSource.discard`
  / `leaveGuard.discard()`, called only by the dialog's Leave without saving; the quiz
  registers one that clears its own kept submission. Reloads, sign-in redirects and the
  browser's own prompt still keep it.

Also from its limitations: the fix-round-5 HUD e2e step reloads the page ("Back to the
path" is a full navigation to a new document), so it does not isolate the same-page
rule. Relabelled to what it proves; the rule itself is unit-tested. At `master` the quiz
page shows no HUD, so R5-001 was not user-visible on the quiz page itself.

Tests: unit (`tests/pending-submission.test.ts` +4, `tests/leave-guard.test.ts` +1);
e2e "a later quiz never overwrites a kept one" and "Leave without saving drops the copy
kept for a resend". Proof: `npm run verify` PASS (19 files / 164 tests); `npm run e2e`
ALL E2E CHECKS PASSED (160 checks).

## Targeted re-check of fix round 6 — Codex (REVISE, 2 medium; accepted as follow-ups)

Runner result `claudex-runs/claudex-frsk1u88/result.json`, fresh session
`01a0e97c-3c68-7731-8d16-abc267d3b47b`, base `1a119dc`, tree `3ce7c9e`, scope limited to
fix round 6; CLI default (`gpt-6-astra` / `high`); usage 663,989 input (569,088 cached),
2,575 output; 117 s. R6-002 resolved; R6-001's reported scenario (a later quiz saving
successfully) resolved. Two findings, both about the single sessionStorage slot:

- **WW-P5-R7-001** a stored A, then quiz B gets 401/403: `postCompletion`'s
  `beforeRedirect` still overwrites A with B. *Pre-existing:* that write is the original
  criterion-21 code, present at every Phase 5 inspection (including `8cb5d1d`); not
  introduced by fix rounds 5 or 6.
- **WW-P5-R7-002** while A is stored, `keepPending(B)` declines, so a B whose send fails
  before the server and is reloaded is lost. *The accepted single-slot limit:* B has
  exactly the protection it had at `8cb5d1d`; round 5 added the safety net whenever the
  slot is free, round 6 stopped it clobbering another quiz.

Compared with `8cb5d1d`, `3ce7c9e` is at least as safe on every path (A kept when B
succeeds; B kept when nothing else waits; Leave without saving discards). Disposition:
closed for Phase 5; **follow-up:** one kept submission per route (per-route keys, a
legacy read of the single key, a non-destructive `beforeRedirect`) as its own small work
order with its own review, if the user wants it.

**Round accounting, Phase 5:** plan review 3 rounds (approved), fix rounds 6, inspections
5 full + 2 targeted re-checks. Closed: every finding through WW-P5-R6-002. Open: the
per-route follow-up (R7-001, R7-002), by decision.
