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
