// Pure, database-free compilation of authored course content into the rows the
// seed writes. Extracted from seed.ts so the same generator can be exercised
// without a database — notably by scripts/spanish-lock.ts, which hashes the
// Spanish output to prove it never changes (see AGENTS.md / PLAN.md).
//
// Nothing in this file may import Prisma or touch I/O. seed.ts owns all writes.

import type { CourseDef, SectionDef, SentenceDef, UnitDef, WordDef } from "./course-data";

// ---------- id helpers ----------

// Combining diacritical marks (U+0300–U+036F) — what NFD splits accents into.
const COMBINING_MARKS = /[̀-ͯ]/g;

// Spanish ("es") keeps the legacy diacritic-stripping slug so its content IDs
// stay byte-identical and existing progress rows remain valid. Every other
// course PRESERVES diacritics, because in Latin vowel length is phonemic:
// "liber" (book) and "līber" (free) are different words and must not collapse
// onto one id. Stripping macrons here silently merged them into a single Word
// row, leaving the "book" challenges pointing at a row meaning "free".
export function makeSlug(preserveDiacritics: boolean) {
  return (str: string) => {
    const base = str.normalize("NFD");
    const folded = preserveDiacritics ? base : base.replace(COMBINING_MARKS, "");
    return folded
      .replace(/[^a-zA-Z0-9̀-ͯ ]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .toLowerCase()
      .normalize("NFC");
  };
}

// The legacy Spanish slug, kept as the default export shape for clarity.
export const slug = makeSlug(false);

export interface CourseCtx {
  code: string;
  promptLang: string;
  wordId: (term: string) => string;
  unitId: (title: string) => string;
}

export function makeCtx(course: CourseDef): CourseCtx {
  // Non-Spanish courses namespace their content IDs with "<code>_". The
  // underscore is deliberate: slug() only ever emits [a-z0-9-] (plus macrons
  // for non-Spanish courses), so "<code>_" can never be produced by a Spanish
  // slug. A hyphen ("<code>-") would be ambiguous — Spanish "la casa" slugs to
  // "la-casa", which would collide with Latin "casa" → "la-casa" and hijack the
  // Spanish word row.
  const isSpanish = course.code === "es";
  const prefix = isSpanish ? "" : `${course.code}_`;
  const courseSlug = makeSlug(!isSpanish);
  return {
    code: course.code,
    promptLang: course.promptLanguageName,
    wordId: (term: string) => `w-${prefix}${courseSlug(term)}`,
    unitId: (title: string) => `u-${prefix}${courseSlug(title)}`,
  };
}

// Deterministic pseudo-shuffle so seeding stays idempotent.
export function rotate<T>(arr: T[], n: number): T[] {
  const k = n % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

// ---------- challenge generation ----------

export interface ChallengeRow {
  id: string;
  lessonId: string;
  type: string;
  order: number;
  prompt: string;
  correctAnswer: string;
  meta: string;
}

function mcChallenge(
  ctx: CourseCtx,
  id: string,
  lessonId: string,
  order: number,
  word: WordDef,
  distractors: WordDef[],
  askTerm: boolean
): ChallengeRow {
  const correct = askTerm ? word.term : word.translation;
  const options = askTerm ? distractors.map((d) => d.term) : distractors.map((d) => d.translation);
  return {
    id,
    lessonId,
    type: "MULTIPLE_CHOICE",
    order,
    prompt: askTerm ? `Which means "${word.translation}"?` : `What does "${word.term}" mean?`,
    correctAnswer: correct,
    meta: JSON.stringify({
      choices: rotate([correct, ...options], order + lessonId.length),
      wordIds: [ctx.wordId(word.term)],
    }),
  };
}

function matchChallenge(
  ctx: CourseCtx,
  id: string,
  lessonId: string,
  order: number,
  words: WordDef[]
): ChallengeRow {
  return {
    id,
    lessonId,
    type: "MATCH",
    order,
    prompt: "Match the pairs",
    correctAnswer: "",
    meta: JSON.stringify({
      pairs: words.map((word) => ({
        term: word.term,
        translation: word.translation,
        wordId: ctx.wordId(word.term),
      })),
      wordIds: words.map((word) => ctx.wordId(word.term)),
    }),
  };
}

// Typed-answer variant of mcChallenge: same alternating direction, but the
// user types the answer instead of picking from choices.
function fillBlankChallenge(
  ctx: CourseCtx,
  id: string,
  lessonId: string,
  order: number,
  word: WordDef,
  askTerm: boolean
): ChallengeRow {
  return {
    id,
    lessonId,
    type: "FILL_BLANK",
    order,
    prompt: askTerm
      ? `Type the ${ctx.promptLang} for "${word.translation}"`
      : `Type the English for "${word.term}"`,
    correctAnswer: askTerm ? word.term : word.translation,
    meta: JSON.stringify({ wordIds: [ctx.wordId(word.term)] }),
  };
}

function translateChallenge(
  ctx: CourseCtx,
  id: string,
  lessonId: string,
  order: number,
  sen: SentenceDef
): ChallengeRow {
  return {
    id,
    lessonId,
    type: "TRANSLATE",
    order,
    prompt: `Translate: "${sen.en}"`,
    correctAnswer: sen.target,
    meta: JSON.stringify({
      wordBank: rotate(sen.bank, sen.target.length),
      wordIds: sen.words.map(ctx.wordId),
    }),
  };
}

export interface BuiltLesson {
  id: string;
  title: string;
  order: number;
  challenges: ChallengeRow[];
}

// 3 lessons per unit: two halves of the vocab, then a checkpoint over all of it.
// fillBlank sections swap multiple choice for typed answers.
export function buildLessons(
  ctx: CourseCtx,
  unitId: string,
  unit: UnitDef,
  distractorPool: WordDef[],
  fillBlank: boolean
): BuiltLesson[] {
  const half1 = unit.words.slice(0, 3);
  const half2 = unit.words.slice(3, 6);
  const others = (exclude: WordDef[]) =>
    distractorPool.filter((d) => !exclude.some((e) => e.term === d.term));

  const lessons: BuiltLesson[] = [];

  const defs: { title: string; words: WordDef[]; sentence: SentenceDef; matchWords: WordDef[] }[] = [
    { title: "Lesson 1", words: half1, sentence: unit.sentences[0], matchWords: half1 },
    { title: "Lesson 2", words: half2, sentence: unit.sentences[1], matchWords: half2 },
    {
      title: "Checkpoint",
      words: [unit.words[0], unit.words[4]],
      sentence: unit.sentences[2],
      matchWords: unit.words.slice(0, 5),
    },
  ];

  defs.forEach((def, li) => {
    const lessonId = `${unitId}-l${li + 1}`;
    const rows: ChallengeRow[] = [];
    let order = 1;
    for (const [wi, word] of def.words.entries()) {
      const askTerm = (wi + li) % 2 === 0;
      if (fillBlank) {
        rows.push(fillBlankChallenge(ctx, `ch-${lessonId}-${order}`, lessonId, order, word, askTerm));
      } else {
        const pool = rotate(others([word]), wi * 5 + li * 3 + unitId.length).slice(0, 3);
        rows.push(mcChallenge(ctx, `ch-${lessonId}-${order}`, lessonId, order, word, pool, askTerm));
      }
      order++;
    }
    rows.push(matchChallenge(ctx, `ch-${lessonId}-${order}`, lessonId, order, def.matchWords));
    order++;
    rows.push(translateChallenge(ctx, `ch-${lessonId}-${order}`, lessonId, order, def.sentence));

    lessons.push({ id: lessonId, title: def.title, order: li + 1, challenges: rows });
  });

  return lessons;
}

// ---------- validation (per course) ----------

export function validate(ctx: CourseCtx, courseSections: SectionDef[], vocab: Map<string, WordDef>) {
  // Base vocab = words taught by non-fillBlank (L1/L2) sections. fillBlank
  // (L3) sections must only reuse these — they reinforce, never introduce.
  const baseVocab = new Map<string, WordDef>();
  for (const section of courseSections)
    if (!section.fillBlank)
      for (const unit of section.units)
        for (const word of unit.words) {
          const prior = baseVocab.get(word.term);
          if (prior && prior.translation !== word.translation)
            throw new Error(
              `[${ctx.code}] Word "${word.term}" defined with conflicting translations: "${prior.translation}" vs "${word.translation}" (${unit.title})`
            );
          baseVocab.set(word.term, word);
        }

  // Distinct terms MUST produce distinct word ids. Without this, two terms that
  // differ only by a diacritic (Latin "liber"/"līber", "malum"/"mālum") collapse
  // onto one id and the second upsert silently overwrites the first — the
  // challenges of the losing word then point at the wrong vocabulary row. The
  // per-term translation check above cannot see this, because it compares terms,
  // not the ids derived from them.
  const wordIdOwner = new Map<string, string>();
  for (const section of courseSections)
    for (const unit of section.units)
      for (const word of unit.words) {
        const id = ctx.wordId(word.term);
        const owner = wordIdOwner.get(id);
        if (owner && owner !== word.term)
          throw new Error(
            `[${ctx.code}] Terms "${owner}" and "${word.term}" both generate word id "${id}" — they would silently overwrite each other`
          );
        wordIdOwner.set(id, word.term);
      }

  const unitIds = new Set<string>();
  for (const section of courseSections) {
    for (const unit of section.units) {
      const unitId = ctx.unitId(unit.title);
      if (unitIds.has(unitId))
        throw new Error(`[${ctx.code}] Duplicate unit id "${unitId}" (title "${unit.title}" twice)`);
      unitIds.add(unitId);

      if (unit.words.length !== 6)
        throw new Error(`[${ctx.code}] Unit "${unit.title}" has ${unit.words.length} words (expected 6)`);

      if (section.fillBlank)
        for (const word of unit.words) {
          const base = baseVocab.get(word.term);
          if (!base)
            throw new Error(`[${ctx.code}] fillBlank unit "${unit.title}" introduces new word "${word.term}"`);
          if (base.translation !== word.translation)
            throw new Error(
              `[${ctx.code}] fillBlank unit "${unit.title}" changes translation of "${word.term}"`
            );
        }

      for (const sen of unit.sentences) {
        for (const term of sen.words)
          if (!vocab.has(term))
            throw new Error(`[${ctx.code}] Sentence references unknown word "${term}" (${unit.title})`);
        // `s()` already guarantees constructibility + token join at authoring
        // time; re-assert defensively here.
        if (sen.target !== sen.targetTokens.join(" "))
          throw new Error(`[${ctx.code}] Sentence "${sen.target}" != targetTokens.join(" ")`);
      }
    }
  }
}

// ---------- whole-course compilation (no I/O) ----------

export interface BuiltCourse {
  code: string;
  words: { id: string; term: string; translation: string }[];
  sections: {
    id: string;
    level: number;
    fillBlank: boolean;
    title: string;
    description: string;
    order: number;
    units: {
      id: string;
      title: string;
      description: string;
      order: number;
      lessons: BuiltLesson[];
    }[];
  }[];
}

// Compiles a course exactly as seedCourse() would write it. Used by the seed
// itself and by the Spanish golden-file lock, so the lock can never drift from
// what actually reaches the database.
export function buildCourse(course: CourseDef): BuiltCourse {
  const ctx = makeCtx(course);

  const vocab = new Map<string, WordDef>();
  for (const section of course.sections)
    for (const unit of section.units) for (const word of unit.words) vocab.set(word.term, word);

  validate(ctx, course.sections, vocab);

  const allWords = [...vocab.values()];

  return {
    code: course.code,
    words: allWords.map((word) => ({
      id: ctx.wordId(word.term),
      term: word.term,
      translation: word.translation,
    })),
    sections: course.sections.map((section, si) => ({
      id: section.id,
      level: section.level ?? 1,
      fillBlank: section.fillBlank ?? false,
      title: section.title,
      description: section.description,
      order: si + 1,
      units: section.units.map((unit, ui) => {
        const unitId = ctx.unitId(unit.title);
        return {
          id: unitId,
          title: unit.title,
          description: unit.description,
          order: ui + 1,
          lessons: buildLessons(ctx, unitId, unit, allWords, section.fillBlank ?? false),
        };
      }),
    })),
  };
}
