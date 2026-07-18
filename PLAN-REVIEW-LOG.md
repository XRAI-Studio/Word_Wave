# Plan Review Log: Add Classical Latin as a second course to WordWave

Act 1 (grill) complete — plan locked with the user. MAX_ROUNDS=5.

## Round 1 — Codex

**Material Flaws**

- SQLite migration underspecified: `Word.term` global `@unique` → `@@unique([courseId, term])` needs table rebuild ordering, backfill, FK/index recreation; naive Prisma migration can drop review links. Fix: explicit reviewed SQL migration + row-count validation.
- `Course.code` not declared unique but seed/active-course lookups depend on `"es"`/`"la"`. Fix: `@unique` + code-based upserts.
- Per-course `LessonProgress`/`WordReview` only works if every content ID is course-prefixed AND routes verify ownership; direct lesson routes are unconstrained. Fix: gate lesson fetch/completion by `Lesson→Unit→Section.courseId === activeCourseId`.
- `/api/review` is cross-course today (all due reviews + all distractor words). Fix: filter by `word.courseId`.
- `/api/review/complete` + lesson completion trust client `wordId`s → can mutate another course's SRS. Fix: validate submitted word IDs belong to active course.
- More shared `User` scalars than named: `lessonsCompleted`, `perfectLessons`, `reviewsCompleted` drive achievements, incremented account-wide. Fix: explicitly decide global vs per-course.
- First-run picker vs nullable `activeCourseId`: new register/Google/guest users can reach `/learn` with null course. Fix: require at creation or gate/redirect null users to picker before `/learn`,`/review`,`/lesson/*`.
- Guest route creates a session with no body. Fix: accept/validate `courseCode`, or create guest after picker.
- Race: switching course mid-session can complete old course under new check / mutate stale review IDs. Fix: snapshot `courseId` in session payload; completion must match.
- Race: duplicate completion POSTs double-award XP/gems/counters. Fix: transaction + award only on incomplete→completed transition.
- `es→target` rename broader than implied (validation, prompts, tokenizer, e2e, `s()` helper). Fix: rename atomically; assert Spanish challenge JSON byte-equivalent.
- Content IDs not course-prefixed except words; `u-${slug(title)}` collides on shared titles (Food/Family). Fix: prefix every content ID with course code.
- Seed `deleteMany({})` wipes entire tree; plan only calls out word pruning. Fix: prune/rebuild by `courseId` or one transaction.
- Greedy bank reconstruction brittle for Latin (inflection/enclitics/order). Fix: author explicit `targetTokens`; validate `target === tokens.join(" ")`.
- "Canonical SOV" pedagogically overconfident; verb-final isn't invariant. Fix: author one accepted target per exercise; don't claim SOV is canonical.
- Orthography mixes eras: `v`+`j` not neutral Classical. Fix: pick/document one convention.
- Normalizer incomplete: `j` doesn't fold to `i`, so typed `Iulius` for `Jūlius` fails. Fix: Latin normalization mapping `j/i`, `v/u`.
- e2e `"Level 3"` title search brittle for grammar-sequenced Latin. Fix: expose level/fillBlank metadata; select structurally.
- e2e hardcodes `¡Muy bien!` in 3 places. Fix: assert stable semantics / fetch active-course labels.
- Observability thin ("spot-check counts"). Fix: post-migration/seed audit script (per-course counts, orphaned progress/reviews, dup slugs, null activeCourseId).
- Simpler alt: Phase 1 doesn't need full multi-course UX + 86 units to de-risk engine. Fix: `Course` + Spanish-only migration + gating first, then tiny Latin fixture, then full L1.

VERDICT: REVISE

### Claude's response

Accepted essentially all findings and revised PLAN.md:
- **Accepted in full:** course-prefix ALL content IDs (fixes the Food/Family collision — a real miss); course-scope the seed rebuild/prune (no more `deleteMany({})` wipe); route gating on lesson + review fetch/complete with `wordId` ownership checks; `/api/review` course-filtering of due reviews + distractor pool; explicit reviewed SQLite migration SQL + `Course.code @unique`; nullable `activeCourseId` route-gating to picker + guest route taking a `courseCode`; race guards (courseId session snapshot; transactional award-on-transition); atomic `es→target` rename with Spanish-JSON byte-equivalence regression; explicit sentence tokens with `target === tokens.join(" ")`; e2e structural fill-blank selection + semantic (not localized-string) assertions; post-migration audit script; finer Phase-1a (engine + tiny Latin fixture) / 1b (full L1) split.
- **Shared-counters decision:** made explicit — `lessonsCompleted`, `perfectLessons`, `reviewsCompleted`, and Achievements stay **global/account-wide**, consistent with the user's "XP is shared" choice. No `UserCourseProgress` model (keeps scope tight).
- **Partially accepted — SOV:** softened. Each exercise still has exactly one authored accepted target (engine constraint), but SOV is now the *unmarked default*, explicitly NOT taught as an invariant. Codex is right that Latin order is discourse-driven.
- **Rejected the "drop `j`" part / kept user's orthography:** the user explicitly chose macrons + `v` + `j` as a display convention; that stands. But Codex's *consequence* (typed `Iulius` fails vs `Jūlius`) is a real bug, resolved by the new `j↔i` / `v↔u` typed-answer normalization rather than by changing the display.

## Round 2 — Codex

Confirmed prior findings addressed. Remaining material problems:

- "Untouched Spanish progress" contradicts course-prefixing every content ID: existing `LessonProgress.lessonId`/`WordReview.wordId` point at old IDs; reseeding as `u-es-*`/`w-es-*` orphans them. Fix: keep existing Spanish IDs stable and prefix only Latin, or migrate old→new IDs across `LessonProgress`, `WordReview`, and `meta.wordIds`.
- Byte-for-byte Spanish JSON regression is incompatible with prefixed Spanish IDs. Fix: normalized comparison that remaps IDs, or preserve Spanish IDs.
- Step 8 wrong that `words` already holds tokens: `words` is SRS vocab and omits connectors (`y`, `es`, `en`); the target token list must include every rendered token in order. Fix: separate `targetTokens` field; keep `words` as SRS metadata.
- Fixture shipped in 1a then "replaced" in 1b will cascade away any fixture Latin `LessonProgress`/`WordReview`. Fix: fixture dev-only, or deliberate reset policy in 1b.
- Active-course handling should be centralized. Fix: `requireActiveCourse()` helper used by all course-aware APIs/layouts.
- Count misleading: 246×6=1,476 slots but L3 reuses L1/L2, so unique `Word` rows are far fewer. Fix: distinguish authored slots from unique rows in verification.

VERDICT: REVISE

### Claude's response

Accepted all six — two caught real correctness bugs in my Round-1 revision:
- **Grandfather Spanish IDs, prefix only Latin.** Spanish keeps its exact current ID scheme (zero progress migration; `meta.wordIds` untouched); Latin gets a `la-` namespace. Collisions are only cross-course, so prefixing the new course alone suffices. This *also* restores the byte-for-byte Spanish-JSON regression as genuinely valid (only an internal field rename changes).
- **Separate `targetTokens` field.** Confirmed `words.join(" ") ≠ target` for connector cases ("gracias y adiós"). Added `targetTokens` (every rendered token, in order); `words` stays SRS metadata; Spanish `targetTokens` back-filled one-time from the existing greedy tokenizer to preserve multi-word bank tokens and identical output.
- **Fixture is dev/e2e-only, never seeded to prod** — so Phase 1b is a clean first prod introduction of Latin with no cascade/reset (documented fallback if the fixture is ever promoted).
- **`requireActiveCourse()`** helper added alongside `requireUser()` in `src/lib/auth.ts`, used by every course-aware API/layout.
- **Counts clarified**: ~1,476 authored slots vs ~980–1,000 unique Latin `Word` rows (L3 reuses); audit distinguishes them.

## Round 3 — Codex

Confirmed Round 2 fixes. Remaining (consistency/tightening):

- ID-policy self-contradiction: progress split said "every content ID course-prefixed" and step 3 still showed `w-<slug>`→`w-<code>-<slug>` for all words, but step 4 grandfathers Spanish. Fix: one rule everywhere — Spanish grandfathered, only Latin/future prefixed.
- Verification still says Spanish JSON identical "pre/post rename and ID re-prefixing" but Spanish isn't re-prefixed. Fix: "pre/post rename and `targetTokens` addition," no Spanish ID changes.
- `POST /api/course/active` underspecified. Fix: validate course exists, reject dev-only/fixture courses in prod, apply via centralized helper.
- Audit should assert no Spanish `Word.id`/`Lesson.id`/`Unit.id`/`Section.id`/`meta.wordIds` changed, not just counts. Fix: add ID-stability audit for grandfathered content.

VERDICT: REVISE

### Claude's response

Accepted all four (consistency tightening from the grandfathering decision):
- Rewrote the progress-split bullet and schema step 3 to a single ID rule: Spanish IDs grandfathered unchanged; only Latin/future courses namespaced. Removed the stray `w-<code>-<slug>` claim for all words.
- Fixed the regression bullet to "pre/post `es→target` rename and `targetTokens` addition" — no Spanish re-prefixing.
- Step 16 now specifies `/api/course/active`: validate course exists, reject dev-only/fixture courses in production, auth required, reads via `requireActiveCourse()`.
- Added an **ID-stability audit**: no grandfathered Spanish `Word/Section/Unit/Lesson/Challenge` id or `meta.wordIds` changed; Spanish progress/review counts identical pre/post.

## Round 4 — Codex

Confirmed Round 3 fixes. New material problems:

- Course-scoped rebuild still breaks "Spanish progress untouched": deleting Spanish `Section`/`Unit`/`Lesson` cascades `LessonProgress`; recreated lessons don't restore it even with identical IDs. Fix: seed must upsert/update in place; no `deleteMany` rebuild for rows with progress.
- `/api/units` must expose `level`/`fillBlank` and layout counts levels, but schema only adds `courseId` to `Section` — no persisted `level`/`fillBlank`. Fix: add `level Int` + `fillBlank Boolean @default(false)` to `Section`, seed them.
- Step 16 rejects dev-only/fixture courses in prod but `Course` has no availability field. Fix: add `isAvailable`/availability metadata; picker/switch filter on it.
- `npm run seed` "counts identical" is impossible with a destructive rebuild. Fix: make the seed idempotent/non-destructive before keeping that gate.

VERDICT: REVISE

### Claude's response

Accepted all four; the first/fourth were the important structural fix:
- **Seed becomes idempotent upsert-in-place** keyed by deterministic content IDs — no blanket `deleteMany`. Rationale captured: cascade deletes `LessonProgress` *before* recreation, so same-ID recreation still loses progress. Only genuinely-removed content is deleted, and a to-be-removed lesson with progress requires a deliberate logged decision. Re-running seed is now safe.
- **Schema additions:** `Section.level Int` + `Section.fillBlank Boolean @default(false)` (persist what was a hardcoded constant / authoring-only flag) so `/api/units` and layout can work structurally.
- **`Course.isAvailable Boolean @default(true)`** — fixture/dev courses set false; picker and `/api/course/active` filter on it in production.
- Verification now includes a **seed-idempotency gate** (run twice → Spanish progress identical).

## Round 5 — Codex

Confirmed all Round 4 fixes. One final tightening: word pruning has the same cascade risk as lesson deletion — deleting a `Word` with `WordReview` rows silently erases SRS history. Fix: mirror the lesson rule for words (never silently delete a word with reviews; logged preservation/reset decision). Judged implementation-critical but aligned with stated audit goals.

VERDICT: APPROVED

### Claude's response

Accepted and folded in (cheap, correct, consistent): the seed's word-pruning rule now mirrors the lesson rule — a `Word` with `WordReview` history is never silently deleted; it requires the same deliberate, logged preservation/reset decision.

---

## Resolution: CONVERGED — APPROVED (Round 5 of 5)

The plan survived 5 rounds of cross-model adversarial review. Codex raised ~30 concrete findings across correctness, security (cross-course SRS access), data-integrity (progress preservation), migration safety, and pedagogy; all were resolved (accepted, or — for the `j` orthography and rigid-SOV points — partially accepted with logged rationale). Final verdict: **APPROVED**. Awaiting user sign-off before any code is written.

