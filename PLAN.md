# Plan: Add a second course — Classical Latin — to WordWave

_Locked via grill — by Claude + Alexander_

## Context

WordWave (repo: lingoduo) is a Duolingo-style app hardwired to a **single Spanish→English course**. There is no `Course`/`Language` concept anywhere — schema, queries, session, or UI. Content is authored as TypeScript word+sentence data (`prisma/course-data-level{1,2,3}.ts`) and mechanically compiled into DB rows by `prisma/seed.ts` (4 challenge types: MULTIPLE_CHOICE, TRANSLATE, MATCH, FILL_BLANK; no audio, no images). The user wants to add **Classical Latin** as a parallel course of identical size, with a Duolingo-style language-swap control in the top bar. This plan adds a course dimension end-to-end and delivers the Latin content in phases.

**Exact structure to mirror:** 3 levels → 30 sections → 246 units (86 / 80 / 80) → 738 lessons. Each unit = **exactly 6 words + 3 sentences**. Level 3 sections are `fillBlank: true` (typed recall reusing L1/L2 vocab). That's ≈ **1,476 authored word *slots* + 738 sentences** — but because L3 only reuses L1/L2 vocabulary, the number of **unique Latin `Word` rows** is far lower (roughly the L1+L2 vocabulary, ~980–1,000). Verification/audit must distinguish authored slots from unique rows.

## Locked decisions & tradeoffs

- **One app, two courses** in the same SQLite DB (not a forked app). The swap button switches the active course in place.
- **Progress split:** XP, streak, gems are **shared account-wide** (stay as `User` scalars — unchanged). So are the other account counters `lessonsCompleted`, `perfectLessons`, `reviewsCompleted`, and all **Achievements** — explicitly **global**, consistent with shared XP (no `UserCourseProgress` model, keeping scope tight). `LessonProgress` (path position) and `WordReview` (SRS queue) become **per-course** via two mechanisms: (a) content IDs are **course-namespaced** — Spanish IDs grandfathered unchanged, only Latin/future courses prefixed (see step 4) — so a row's ID already implies its course; and (b) the lesson/review routes actively **gate by `activeCourseId`** (see Route gating). It does **not** fall out for free.
- **Latin-appropriate curriculum, identical counts** — sequenced by Latin grammar (declensions → cases → conjugations → tenses), not a 1:1 translation of the Spanish themes.
- **Orthography:** display macrons (ā ē ī ō ū), consonantal **v** (vīta), and **j** for consonantal i (Jūlius, jam) — the user's explicit choice. Because `j`/`v` are display conventions, **typed answers must be convention-insensitive**: add Latin-specific normalization that folds `j↔i` and `v↔u` (in addition to the existing macron/diacritic strip), so a learner typing `Iulius` or `uita` is accepted for displayed `Jūlius`/`vīta`. Without this, typed FILL_BLANK answers silently fail.
- **Word order:** each sentence is authored with **exactly one accepted target string + its ordered token list**, defaulting to the **unmarked SOV order** as the beginner baseline. SOV is treated as the *default*, **not** taught as an invariant (Latin order is discourse-driven). The engine stays single-answer; no multi-order support.
- **Accuracy:** anchor vocabulary to the published **Dickinson (DCC) Latin Core ~1000** list + themed extensions (authoritative dictionary forms), then run a **dedicated grammar-review pass** (adversarial second-model check) validating case agreement, verb endings, and macrons on every sentence before seeding. The seed's `validate()` only checks *structure*, never grammar — this pass is the grammar guardrail.
- **Swap control:** Duolingo-style — a flag/emblem button in the top bar showing the active course, opening a course menu to switch. Spanish flag for Spanish; an **SPQR / Roman emblem** for Latin (no national flag exists). Persists to the user's `activeCourseId`.
- **Onboarding:** a **first-run course picker** for new users and guests (choose Spanish or Latin). Existing users default to Spanish; their current progress stays under Spanish, untouched.
- **Delivery is phased** (see below) — de-risks the huge content author and gives a testable app sooner.

## Approach

### Schema (`prisma/schema.prisma` + migration)
1. New **`Course`** model: `id`, `code @unique` (`"es"`, `"la"` — stable lookup key for seed + active-course; use code-based upserts), `name`, `promptLanguageName` (for "Type the {X} for…"), `emblem`, `order`, `correctLabel`, `celebrateLabel` (course-configurable feedback strings — Spanish keeps `¡Correcto!`/`¡Muy bien!`; Latin uses e.g. `Rēctē!`/`Euge!`), and **`isAvailable Boolean @default(true)`** (dev-only/fixture courses set this false; the picker and `/api/course/active` filter on it in production).
2. Add `courseId` FK to **`Section`** and **`Word`** (Section is the top of the content tree; Unit/Lesson/Challenge inherit course through their relations). Also add **`level Int`** and **`fillBlank Boolean @default(false)`** to `Section` — currently level is a hardcoded `COURSE_LEVELS = 3` constant and `fillBlank` is authoring-only/never persisted. Persist both so `/api/units` can expose them and layout can count levels per course structurally.
3. Change `Word.term @unique` → **`@@unique([courseId, term])`**. On SQLite this is a **table rebuild**, not a cheap alter — write/review the migration SQL explicitly: create `Course`, insert the Spanish row, add nullable `courseId`, backfill all existing `Word`/`Section` rows to Spanish, rebuild `Word` with the composite unique + recreate indexes/FKs (**preserving `WordReview` links and existing `Word.id` values unchanged**), then make `courseId` non-null. (Word ID *scheme* by course is defined in step 4 — Spanish IDs are grandfathered, not rewritten.)
4. **Grandfather Spanish's existing content IDs; course-prefix ONLY new (Latin) content.** Spanish keeps its current ID scheme exactly (`w-<slug>`, `u-<slug(title)>`, `section-*`, lesson/challenge IDs) so existing `LessonProgress.lessonId`, `WordReview.wordId`, and challenge `meta.wordIds` stay valid with **zero data migration**. Latin (and any future course) gets a `<code>-` namespace (`w-la-…`, `u-la-…`, `section-la-…`). Collisions are only possible *between* courses, so prefixing just the new course fully prevents the "Food"/"Family" clash while touching no existing progress row.
5. Add nullable **`activeCourseId`** to `User` (null ⇒ first-run picker). **Migration backfills** every existing user's `activeCourseId` to Spanish so no existing user ever sees the picker or a null state.
6. Leave `LessonProgress`/`WordReview` keys and the shared `User` counters (XP, streak, gems, `lessonsCompleted`, `perfectLessons`, `reviewsCompleted`) unchanged — per-course siloing comes from course-prefixed IDs + route gating, not new columns.

### Authoring layer (`prisma/course-types.ts`, `course-data.ts`, seed)
7. **Atomic** `es → target` rename: the `SentenceDef.es` field encodes Spanish semantics in the type, the `s()` helper, `seed.ts` prompt/`sen.es` usage, `constructible()`, and the e2e solver — rename the field and **all** consumers in one pass. Regression gate: assert generated **Spanish** challenge JSON is **byte-for-byte identical** before/after — which is now genuinely achievable precisely because Spanish IDs are grandfathered (step 4) and only an internal field name changes.
8. Add a **separate `targetTokens: string[]`** field to `SentenceDef` — the full ordered list of every rendered bank token (including connectors like `y`/`et`, which the existing `words` array omits since `words` is SRS-vocab metadata, not the token sequence). `validate()` asserts `target === targetTokens.join(" ")` exactly, and that each `targetTokens` entry exists in the bank. For Spanish, populate `targetTokens` one-time from the current greedy `constructible()` tokenization (preserving multi-word bank tokens like "buenos días") so Spanish output is unchanged; Latin authors write `targetTokens` explicitly. This removes reliance on greedy longest-first matching from a distractor-laced bank, which is brittle for inflected Latin.
9. Restructure the aggregator into a **course-aware** export: `courses = [{ code:"es", …, sections }, { code:"la", …, sections }]`.
10. New Latin content files: **`prisma/course-data-latin-level1.ts`** (Phase 1b), `…-level2.ts`, `…-level3.ts` (later phases). A tiny **Latin fixture** section ships in Phase 1a to prove the pipeline.
11. Make **`seed.ts` course-scoped AND idempotent/non-destructive**: iterate over courses; per-course section `order`. **Replace the `db.section.deleteMany({})` / `db.unit.deleteMany({})` blanket rebuild with upsert-in-place** keyed by the deterministic content IDs (`Section`/`Unit`/`Lesson`/`Challenge`). This is required, not optional: those content rows cascade to `LessonProgress` on delete, so a delete-then-recreate — even with an identical grandfathered ID — permanently loses the progress row (it cascades away *before* the row is recreated). The seed must therefore **update existing rows in place** and only **delete content that is genuinely removed**; if a to-be-removed lesson has `LessonProgress`, that deletion needs a deliberate, logged preservation/reset decision (not a silent cascade). **The same rule applies to word pruning**: never silently delete a `Word` that has `WordReview` rows (it would erase SRS history) — prune only within the course, and a word with review history requires the same logged preservation/reset decision. Prompt strings from `course.promptLanguageName`. Keep `validate()` (6 words/3 sentences, exact `targetTokens` join, L3-reuse rule) per course. Net effect: re-running `npm run seed` is safe and leaves existing Spanish progress identical.

### App / UI + Route gating
Add a single **`requireActiveCourse()`** server helper (alongside the existing `requireUser()`/`getSessionUser()` in `src/lib/auth.ts`) that resolves the session user's active `Course` and centralizes the null/invalid-`activeCourseId` decision (throw/redirect to picker). **Every** course-aware API and layout uses it, so course resolution is not re-implemented per route.

12. **`src/app/api/units/route.ts`** — filter `section.findMany` by `requireActiveCourse()`; also expose per-section `level`/`fillBlank` metadata so clients (and e2e) can select structurally instead of by title text.
13. **Gate the direct content routes by course** (currently unconstrained): `GET /api/lessons/[lessonId]` and `/complete`, and `/api/review` + `/api/review/complete`, must verify the lesson (`Lesson→Unit→Section.courseId`) and every submitted `wordId` belong to the user's `activeCourseId`. `/api/review` must filter both due reviews **and** the distractor word pool by `word.courseId` (it fetches all words today). This closes a cross-course data-integrity/SRS-mixing hole.
14. **Race guards:** include a `courseId` snapshot in the lesson/review session payload; completion must match that snapshot (so swapping course mid-session can't complete the old course under the new active check). Wrap lesson completion + reward writes in a **transaction** that awards XP/gems/counters **only on the incomplete→completed transition** (prevents double-award on duplicate POSTs).
15. **`src/app/(main)/layout.tsx`** — course counts filtered by active course; replace hardcoded `COURSE_LEVELS = 3` with a per-course level count. **Redirect users with null `activeCourseId` to the picker** before `/learn`, `/review`, `/lesson/*` (layout- or middleware-level), so no entry point (register, Google OAuth, guest) can reach the app course-less.
16. **`src/components/top-bar.tsx`** — Duolingo-style course-swap emblem/dropdown; `POST /api/course/active` (server action) sets `activeCourseId` and reloads the path. It must **validate the target course exists**, **reject dev-only/fixture courses in production** (only courses flagged available may be selected), require an authenticated user, and route all subsequent reads through `requireActiveCourse()` so the new selection is applied consistently.
17. **First-run course picker** — shown when `activeCourseId` is null. **Guest creation (`api/auth/guest`) must accept/validate a `courseCode`** (today it creates a session with no body) — either take the picked course in the body, or create the guest only after the pick.
18. Course-aware copy: `manifest.ts`, root `layout.tsx` title, `profile/page.tsx` ("Learning {language} since…"), and quiz/result feedback strings read from the active course instead of hardcoded Spanish.

### Latin curriculum shape (grammar-sequenced, same counts)

> **Revised 2026-08-01 after the Level 1 grammar review.** Level 1 was authored broader than
> this section originally specified — it teaches the ablative, all prepositions, adjective
> agreement, and a handful of 3rd/4th-declension nouns and 3rd/4th-conjugation verbs, which
> were originally assigned to Level 2. That was reviewed and **accepted**: withholding the
> ablative and prepositions leaves Level 1 unable to express much, and mainstream beginner
> courses introduce them early too. The Level 2 spec below has been rewritten to **build on**
> Level 1 rather than re-teach it. The grammar review found no case, agreement, or verb-ending
> errors in Level 1's 258 sentences.

- **Level 1** (10 sections / 86 units) — **as built**: 1st & 2nd declension nouns (m/f/n),
  nominative + accusative + ablative, `sum`, adjective agreement (1st/2nd declension),
  prepositions with the accusative and with the ablative, present tense **3rd person only**
  (singular and plural), plurals, numbers 1–10, adverbs and coordinating conjunctions.
  Vocabulary is concrete (people, home, nature, food, war, town, school). A few
  3rd/4th-declension nouns and 3rd/4th-conjugation verbs appear as unanalysed whole words.
- **Level 2** (10 / 80) — everything Level 1 left untouched:
  - **The 3rd declension taught systematically** (consonant stems, i-stems, neuters), turning
    L1's memorised `arbor`/`mōns`/`rēx`/`pāx`/`mare` into an understood pattern; then the
    4th and 5th declensions.
  - **Genitive and dative** — the two cases L1 never uses at all.
  - **1st and 2nd person verbs** — L1 is entirely 3rd person, so `sum/es/est`, `-ō/-s/-t`,
    `-mus/-tis/-nt` across all four conjugations is new ground, as is the systematic
    treatment of 3rd/4th conjugation.
  - Comparative and superlative adjectives; adverb formation; the remaining prepositions.
- **Level 3** (10 / 80, `fillBlank`): imperfect/perfect/future tenses, personal and relative
  pronouns, subordinate clauses — **reusing only L1/L2 vocab** (enforced by `validate()`), so
  L3 authoring depends on L1+L2 vocab being final.

## Phasing

- **Phase 1a — Engine, Spanish-only migration, gating, tiny Latin fixture.** Land ALL plumbing (schema + explicit SQL migration, Latin-only ID prefixing, `es→target` rename + `targetTokens`, course-scoped seed, `requireActiveCourse()` gating + race guards, picker, swap control, course-aware copy) with the **existing Spanish course migrated in place** and a **tiny hand-verified Latin fixture** (e.g. 1 section / a few units) to prove the two-course pipeline end-to-end. The fixture is **dev/e2e-only — never seeded to production** (so no real user accrues fixture Latin progress that Phase 1b would cascade away). This de-risks the engine independently of bulk content. e2e green here.
- **Phase 1b — Latin Level 1** (10 sections / ~86 units), fully authored + grammar-verified. Production sees Latin for the first time here; because the fixture never shipped to prod, 1b is a clean introduction with no progress-reset needed. (If the fixture is ever promoted to prod, Phase 1b must instead carry a deliberate Latin-progress reset.)
- **Phase 2 — Latin Level 2** (content-only).
- **Phase 3 — Latin Level 3** (content-only; depends on L1+L2 vocab final for the reuse rule).

## Verification

- **Migration:** the explicit SQL applies cleanly; a **post-migration/seed audit script** reports per-course counts (distinguishing authored slots from **unique `Word` rows**), orphaned `LessonProgress`/`WordReview`, duplicate content slugs, and any null `activeCourseId` — must be all-zero for the orphan/dup/null classes. **ID-stability audit:** assert that no grandfathered Spanish `Word.id`, `Section.id`, `Unit.id`, `Lesson.id`, `Challenge.id`, or challenge `meta.wordIds` value changed, and that Spanish `LessonProgress`/`WordReview` counts are **identical** pre/post. Spot-checking counts alone is insufficient.
- **Spanish-unchanged regression:** generated Spanish challenge JSON is byte-for-byte identical pre/post the `es→target` rename and `targetTokens` addition — Spanish IDs are **not** re-prefixed, so nothing but the internal field name changes.
- `npm run seed` succeeds and is **idempotent**: running it twice (with existing Spanish progress present) leaves every Spanish `LessonProgress`/`WordReview` row identical — proving the upsert-in-place seed is non-destructive. `validate()` (incl. exact `target === targetTokens.join(" ")`) passes for **both** courses.
- **Grammar-review pass** signs off each Latin phase: dictionary forms match DCC, every sentence has correct case agreement + verb endings + macrons.
- `npm run e2e` — update `scripts/e2e.ts`: after register, handle the course picker (pick Spanish); **select the fill-blank lesson via the new `level`/`fillBlank` API metadata, not a `"Level 3"` title match**; assert on **stable semantics** (XP +20, gem delta, path advance) rather than localized strings like `¡Muy bien!`. Add a **Latin smoke test**: switch course → load Latin path → complete a lesson → swap back → confirm progress is siloed per course and shared XP moved once.
- **Manual drive:** register → picker → pick Latin → Latin path renders with macrons → complete a lesson (typed `Iulius`/`uita` accepted for `Jūlius`/`vīta`) → swap to Spanish via top bar → Spanish path + separate SRS queue intact; shared XP/streak/gems moved once total.

## Risks / open questions

- **Volume/accuracy of Latin** is the dominant risk — mitigated by DCC anchoring, the grammar-review gate, and phasing (fixture → L1 → L2 → L3).
- **Migration on SQLite** (composite-unique table rebuild) is the highest-risk mechanical step — mitigated by explicit reviewed SQL + the audit script + Spanish-unchanged regression.
- **Cross-course data integrity**: without the route gating + `wordId` ownership checks, a client could read/mutate another course's SRS — the gating in step 13 is load-bearing, not optional.
- **`es`→`target` rename** touches type, helper, seed, and e2e — must be atomic and Spanish-content-neutral.
- **L3 reuse rule** couples L3 authoring to a finalized L1+L2 vocab set (respected by phase ordering).
- **Guest + picker** interaction (guest creation must accept a course code).
- **SOV as default, not invariant** — authored order stays natural/standard per sentence; we do not claim verb-final is a rule.

## Out of scope

- Audio/TTS and images (the app has neither for Spanish either).
- More than two languages (schema allows it; not built).
- Engine support for multiple valid Latin word orders.
- Changes to the SRS algorithm or gamification math.

---

_Next: Act 2 — hand this plan to Codex for adversarial read-only review (VERDICT: APPROVED/REVISE), revise, then final user sign-off before any code is written._
