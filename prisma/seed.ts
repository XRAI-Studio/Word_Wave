import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { sections, type SentenceDef, type UnitDef, type WordDef } from "./course-data";

const dbFile = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, "dev.db");
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbFile}` }) });

// Course content lives in ./course-data.ts; this file turns it into rows.
// Each unit provides exactly 6 words and 3 sentences; the generator below
// turns that into 3 lessons (Lesson 1: first 3 words + sentence 1,
// Lesson 2: last 3 words + sentence 2, Checkpoint: everything + sentence 3).

// ---------- generation ----------

const slug = (str: string) =>
  str
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .toLowerCase();

const wordId = (term: string) => `w-${slug(term)}`;

// Deterministic pseudo-shuffle so seeding stays idempotent.
function rotate<T>(arr: T[], n: number): T[] {
  const k = n % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}

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
      wordIds: [wordId(word.term)],
    }),
  };
}

function matchChallenge(id: string, lessonId: string, order: number, words: WordDef[]): ChallengeRow {
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
        wordId: wordId(word.term),
      })),
      wordIds: words.map((word) => wordId(word.term)),
    }),
  };
}

// Typed-answer variant of mcChallenge: same alternating direction, but the
// user types the answer instead of picking from choices.
function fillBlankChallenge(
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
      ? `Type the Spanish for "${word.translation}"`
      : `Type the English for "${word.term}"`,
    correctAnswer: askTerm ? word.term : word.translation,
    meta: JSON.stringify({ wordIds: [wordId(word.term)] }),
  };
}

function translateChallenge(id: string, lessonId: string, order: number, sen: SentenceDef): ChallengeRow {
  return {
    id,
    lessonId,
    type: "TRANSLATE",
    order,
    prompt: `Translate: "${sen.en}"`,
    correctAnswer: sen.es,
    meta: JSON.stringify({
      wordBank: rotate(sen.bank, sen.es.length),
      wordIds: sen.words.map(wordId),
    }),
  };
}

// 3 lessons per unit: two halves of the vocab, then a checkpoint over all of it.
// fillBlank sections swap multiple choice for typed answers.
function buildLessons(unitId: string, unit: UnitDef, distractorPool: WordDef[], fillBlank: boolean) {
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
        rows.push(fillBlankChallenge(`ch-${lessonId}-${order}`, lessonId, order, word, askTerm));
      } else {
        const pool = rotate(others([word]), wi * 5 + li * 3 + unitId.length).slice(0, 3);
        rows.push(mcChallenge(`ch-${lessonId}-${order}`, lessonId, order, word, pool, askTerm));
      }
      order++;
    }
    rows.push(matchChallenge(`ch-${lessonId}-${order}`, lessonId, order, def.matchWords));
    order++;
    rows.push(translateChallenge(`ch-${lessonId}-${order}`, lessonId, order, def.sentence));

    lessons.push({ id: lessonId, title: def.title, order: li + 1, challenges: rows });
  });

  return lessons;
}

// ---------- validation ----------

// Greedy longest-token-first reconstruction; mirrors how the quiz expects the
// sentence to be assembled from its bank.
function constructible(es: string, bank: string[]): boolean {
  let rest = es;
  while (rest.length) {
    const hit = [...bank]
      .filter((t) => rest === t || rest.startsWith(t + " "))
      .sort((a, b) => b.length - a.length)[0];
    if (!hit) return false;
    rest = rest.slice(hit.length).trimStart();
  }
  return true;
}

function validate(vocab: Map<string, WordDef>) {
  // Base vocab = words taught by non-fillBlank (L1/L2) sections. fillBlank
  // (L3) sections must only reuse these — they reinforce, never introduce.
  const baseVocab = new Map<string, WordDef>();
  for (const section of sections)
    if (!section.fillBlank)
      for (const unit of section.units)
        for (const word of unit.words) {
          const prior = baseVocab.get(word.term);
          if (prior && prior.translation !== word.translation)
            throw new Error(
              `Word "${word.term}" defined with conflicting translations: "${prior.translation}" vs "${word.translation}" (${unit.title})`
            );
          baseVocab.set(word.term, word);
        }

  const unitIds = new Set<string>();
  for (const section of sections) {
    for (const unit of section.units) {
      const unitId = `u-${slug(unit.title)}`;
      if (unitIds.has(unitId))
        throw new Error(`Duplicate unit id "${unitId}" (title "${unit.title}" appears twice)`);
      unitIds.add(unitId);

      if (unit.words.length !== 6)
        throw new Error(`Unit "${unit.title}" has ${unit.words.length} words (expected 6)`);

      if (section.fillBlank)
        for (const word of unit.words) {
          const base = baseVocab.get(word.term);
          if (!base)
            throw new Error(`fillBlank unit "${unit.title}" introduces new word "${word.term}"`);
          if (base.translation !== word.translation)
            throw new Error(
              `fillBlank unit "${unit.title}" changes translation of "${word.term}": "${base.translation}" vs "${word.translation}"`
            );
        }

      for (const sen of unit.sentences) {
        for (const term of sen.words)
          if (!vocab.has(term))
            throw new Error(`Sentence references unknown word "${term}" (${unit.title})`);
        if (!constructible(sen.es, sen.bank))
          throw new Error(`Sentence "${sen.es}" not constructible from its bank (${unit.title})`);
      }
    }
  }
}

// ---------- main ----------

async function main() {
  // Vocabulary first (upserted, then pruned to the current course below;
  // WordReview rows for surviving words carry over across reseeds).
  const vocab = new Map<string, WordDef>();
  for (const section of sections)
    for (const unit of section.units)
      for (const word of unit.words) vocab.set(word.term, word);

  validate(vocab);

  for (const word of vocab.values()) {
    await db.word.upsert({
      where: { id: wordId(word.term) },
      update: { term: word.term, translation: word.translation },
      create: { id: wordId(word.term), term: word.term, translation: word.translation },
    });
  }

  // Prune vocabulary that has left the course. WordReview rows for words still
  // in the course are preserved across reseeds; only reviews for removed words
  // are cascaded away (that word is gone, so its schedule should go too).
  const keepIds = [...vocab.values()].map((word) => wordId(word.term));
  await db.word.deleteMany({ where: { id: { notIn: keepIds } } });

  // Course structure is rebuilt from scratch (cascades clear old lessons/challenges).
  await db.section.deleteMany({});
  await db.unit.deleteMany({});

  const allWords = [...vocab.values()];

  for (const [si, section] of sections.entries()) {
    await db.section.create({
      data: { id: section.id, title: section.title, description: section.description, order: si + 1 },
    });

    for (const [ui, unit] of section.units.entries()) {
      const unitId = `u-${slug(unit.title)}`;
      await db.unit.create({
        data: {
          id: unitId,
          sectionId: section.id,
          title: unit.title,
          description: unit.description,
          order: ui + 1,
        },
      });

      for (const lesson of buildLessons(unitId, unit, allWords, section.fillBlank ?? false)) {
        await db.lesson.create({
          data: { id: lesson.id, unitId, title: lesson.title, order: lesson.order },
        });
        await db.challenge.createMany({ data: lesson.challenges });
      }
    }
  }

  const counts = {
    sections: await db.section.count(),
    units: await db.unit.count(),
    lessons: await db.lesson.count(),
    challenges: await db.challenge.count(),
    words: await db.word.count(),
  };
  console.log("Seeded:", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
