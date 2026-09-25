<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Word Wave: rules for agents

A Travel Schooling class (game slug `wordwave`, hostname `wordwave.travelschooling.com`).
It conforms to the class standard in `travelschooling-portal/docs/class-standard.md`.
Phase 5 work order and log: `docs/plans/2026-09-25-class-standard-phase5.md` and
`-log.md`. `PLAN.md` and `PLAN-REVIEW-LOG.md` are the app's original build history.

Rules:
- There is no local sign-in. Every API route calls `requireUser` or
  `requireActiveCourse` from `src/lib/auth.ts` before anything else
  (`tests/api-routes-auth.test.ts` enforces it).
- `src/proxy.ts`, `src/lib/session.ts`, `src/lib/session-cookie.ts` stay byte-identical to
  Word Power's; `src/lib/kit.ts` stays byte-identical to Factors'.
- XP is awarded only on the server, with the learner's token, after progress is committed,
  and only with events in the portal's `supabase/seed.sql` (`lesson_complete`,
  `review_session`, achievement `wordwave-first-lesson`). Never the service role.
- Every table lives in schema `wordwave`; the app's role `wordwave_app` can reach nothing
  else. Migrations and the seed run by hand (README "Deploy"), never at build time.
- The repository is public: no connection string or key is ever committed.
  `.env.wordwave-prod` (git-ignored) holds the production URLs on the maintainer's machine.
- `NEXT_PUBLIC_TS_KIT` is never set on Vercel; `NEXT_PUBLIC_SUPABASE_URL`,
  `SUPABASE_ANON_KEY` and `DATABASE_URL` must be.
