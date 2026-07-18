import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import {
  courses,
  type CourseDef,
  type SectionDef,
  type SentenceDef,
  type UnitDef,
  type WordDef,
} from "./course-data";

const dbFile = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, "dev.db");
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbFile}` }) });

// Course content lives in ./course-data.ts; this file turns it into rows.
// Each unit provides exactly 6 words and 3 sentences; the generator below
// turns that into 3 lessons (Lesson 1: first 3 words + sentence 1,
// Lesson 2: last 3 words + sentence 2, Checkpoint: everything + sentence 3).
//
// The seed is IDEMPOTENT and NON-DESTRUCTIVE: it upserts rows in place (never
// a blanket deleteMany) so re-running never cascades away LessonProgress /
// WordReview. It is course-scoped: Spanish IDs are grandfathered unchanged;
// every other course namespaces its content IDs with its course code.

// ---------- id helpers ----------

const slug = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

// Spanish ("es") keeps its legacy un-prefixed IDs so existing progress rows
// stay valid; every other course prefixes its content IDs with its code.
interface CourseCtx {
  code: string;
  promptLang: string;
  wordId: (term: string) => string;
  unitId: (title: string) => string;
}

function makeCtx(course: CourseDef): CourseCtx {
  const prefix = course.code === "es" ? "" : `${course.code}-`;
  return {
    code: course.code,
    promptLang: course.promptLanguageName,
    wordId: (term: string) => `w-${prefix}${slug(term)}`,
    unitId: (title: string) => `u-${prefix}${slug(title)}`,
  };
}

// Deterministic pseudo-shuffle so seeding stays idempotent.
function rotate<T>(arr: T[], n: number): T[] {
  const k = n % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

// ---------- challenge generation ----------

interface ChallengeRow {
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

// 3 lessons per unit: two halves of the vocab, then a checkpoint over all of it.
// fillBlank sections swap multiple choice for typed answers.
function buildLessons(
  ctx: CourseCtx,
  unitId: string,
  unit: UnitDef,
  distractorPool: WordDef[],
  fillBlank: boolean
) {
  const half1 = unit.words.slice(0, 3);
  const half2 = unit.words.slice(3, 6);
  const others = (exclude: WordDef[]) =>
    distractorPool.filter((d) => !exclude.some((e) => e.term === d.term));

  const lessons: { id: string; title: string; order: number; challenges: ChallengeRow[] }[] = [];

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

function validate(ctx: CourseCtx, courseSections: SectionDef[], vocab: Map<string, WordDef>) {
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

// ---------- per-course seeding (idempotent upsert-in-place) ----------

async function seedCourse(course: CourseDef, order: number) {
  const ctx = makeCtx(course);

  const vocab = new Map<string, WordDef>();
  for (const section of course.sections)
    for (const unit of section.units) for (const word of unit.words) vocab.set(word.term, word);

  validate(ctx, course.sections, vocab);

  await db.course.upsert({
    where: { code: course.code },
    update: {
      name: course.name,
      promptLanguageName: course.promptLanguageName,
      emblem: course.emblem,
      order,
      correctLabel: course.correctLabel,
      celebrateLabel: course.celebrateLabel,
      isAvailable: course.isAvailable,
    },
    create: {
      id: course.code,
      code: course.code,
      name: course.name,
      promptLanguageName: course.promptLanguageName,
      emblem: course.emblem,
      order,
      correctLabel: course.correctLabel,
      celebrateLabel: course.celebrateLabel,
      isAvailable: course.isAvailable,
    },
  });
  const courseId = course.code;

  // --- vocabulary: upsert, then SAFE prune (never delete a word with reviews) ---
  for (const word of vocab.values()) {
    const id = ctx.wordId(word.term);
    await db.word.upsert({
      where: { id },
      update: { courseId, term: word.term, translation: word.translation },
      create: { id, courseId, term: word.term, translation: word.translation },
    });
  }
  const keepWordIds = new Set([...vocab.values()].map((word) => ctx.wordId(word.term)));
  const staleWords = await db.word.findMany({
    where: { courseId, id: { notIn: [...keepWordIds] } },
    include: { _count: { select: { reviews: true } } },
  });
  for (const word of staleWords) {
    if (word._count.reviews > 0) {
      console.warn(`[${course.code}] keeping removed word "${word.term}" (${word._count.reviews} reviews)`);
      continue;
    }
    await db.word.delete({ where: { id: word.id } });
  }

  // --- structure: upsert sections/units/lessons/challenges in place ---
  const allWords = [...vocab.values()];
  const keepSectionIds = new Set<string>();
  const keepUnitIds = new Set<string>();
  const keepLessonIds = new Set<string>();

  for (const [si, section] of course.sections.entries()) {
    keepSectionIds.add(section.id);
    await db.section.upsert({
      where: { id: section.id },
      update: {
        courseId,
        level: section.level ?? 1,
        fillBlank: section.fillBlank ?? false,
        title: section.title,
        description: section.description,
        order: si + 1,
      },
      create: {
        id: section.id,
        courseId,
        level: section.level ?? 1,
        fillBlank: section.fillBlank ?? false,
        title: section.title,
        description: section.description,
        order: si + 1,
      },
    });

    for (const [ui, unit] of section.units.entries()) {
      const unitId = ctx.unitId(unit.title);
      keepUnitIds.add(unitId);
      await db.unit.upsert({
        where: { id: unitId },
        update: { sectionId: section.id, title: unit.title, description: unit.description, order: ui + 1 },
        create: {
          id: unitId,
          sectionId: section.id,
          title: unit.title,
          description: unit.description,
          order: ui + 1,
        },
      });

      for (const lesson of buildLessons(ctx, unitId, unit, allWords, section.fillBlank ?? false)) {
        keepLessonIds.add(lesson.id);
        await db.lesson.upsert({
          where: { id: lesson.id },
          update: { unitId, title: lesson.title, order: lesson.order },
          create: { id: lesson.id, unitId, title: lesson.title, order: lesson.order },
        });
        // Challenges carry no progress; refresh them wholesale for this lesson.
        const keepChallengeIds = lesson.challenges.map((c) => c.id);
        await db.challenge.deleteMany({
          where: { lessonId: lesson.id, id: { notIn: keepChallengeIds } },
        });
        for (const ch of lesson.challenges) {
          await db.challenge.upsert({ where: { id: ch.id }, update: ch, create: ch });
        }
      }
    }
  }

  // --- SAFE structural prune (never delete content that has progress) ---
  await pruneStale(courseId, keepSectionIds, keepUnitIds, keepLessonIds, course.code);
}

// Remove content that has left the course, but never silently delete a lesson
// with LessonProgress (that would erase a learner's history); such rows are
// kept and logged for a deliberate decision instead.
async function pruneStale(
  courseId: string,
  keepSectionIds: Set<string>,
  keepUnitIds: Set<string>,
  keepLessonIds: Set<string>,
  code: string
) {
  const staleLessons = await db.lesson.findMany({
    where: { unit: { section: { courseId } }, id: { notIn: [...keepLessonIds] } },
    include: { _count: { select: { progress: true } } },
  });
  for (const lesson of staleLessons) {
    if (lesson._count.progress > 0) {
      console.warn(`[${code}] keeping removed lesson "${lesson.id}" (${lesson._count.progress} progress rows)`);
      continue;
    }
    await db.lesson.delete({ where: { id: lesson.id } });
  }

  // A unit/section is safe to delete only once it has no lessons left at all.
  const staleUnits = await db.unit.findMany({
    where: { section: { courseId }, id: { notIn: [...keepUnitIds] } },
    include: { _count: { select: { lessons: true } } },
  });
  for (const unit of staleUnits)
    if (unit._count.lessons === 0) await db.unit.delete({ where: { id: unit.id } });

  const staleSections = await db.section.findMany({
    where: { courseId, id: { notIn: [...keepSectionIds] } },
    include: { _count: { select: { units: true } } },
  });
  for (const section of staleSections)
    if (section._count.units === 0) await db.section.delete({ where: { id: section.id } });
}

// ---------- main ----------

async function main() {
  for (const [i, course] of courses.entries()) {
    await seedCourse(course, i + 1);
  }

  const counts = {
    courses: await db.course.count(),
    sections: await db.section.count(),
    units: await db.unit.count(),
    lessons: await db.lesson.count(),
    challenges: await db.challenge.count(),
    words: await db.word.count(),
  };
  console.log("Seeded:", counts);
  const perCourse = await db.course.findMany({
    orderBy: { order: "asc" },
    select: { code: true, _count: { select: { sections: true, words: true } } },
  });
  for (const c of perCourse)
    console.log(`  ${c.code}: ${c._count.sections} sections, ${c._count.words} words`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
