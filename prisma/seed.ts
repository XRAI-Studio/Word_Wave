import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { courses, type CourseDef } from "./course-data";
import { buildCourse, makeCtx } from "./course-build";
import { resolveDbPath } from "../src/lib/db-path";

const dbFile = resolveDbPath(process.env.DATABASE_PATH, path.join(__dirname, "dev.db"));
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbFile}` }) });

// Course content lives in ./course-data.ts; ./course-build.ts compiles it into
// rows (pure, no I/O); this file writes those rows.
//
// The seed is IDEMPOTENT and NON-DESTRUCTIVE: it upserts rows in place (never
// a blanket deleteMany) so re-running never cascades away LessonProgress /
// WordReview. It is course-scoped: Spanish IDs are grandfathered unchanged;
// every other course namespaces its content IDs with its course code.

// ---------- per-course seeding (idempotent upsert-in-place) ----------

async function seedCourse(course: CourseDef, order: number) {
  // buildCourse() validates and compiles; it throws before any write if the
  // authored content is structurally wrong or would generate colliding ids.
  const built = buildCourse(course);
  const ctx = makeCtx(course);
  const courseId = course.code;

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

  // --- vocabulary: SAFE prune first, then upsert ---
  //
  // The prune MUST precede the upserts. Word has a @@unique([courseId, term]),
  // so when a term's generated id changes — as every Latin word's did when the
  // slug started preserving macrons — the stale row still owns that
  // (courseId, term) pair. Creating the new id would violate the constraint
  // before the old row was ever cleaned up. Pruning first releases the pair.
  const keepWordIds = new Set(built.words.map((word) => word.id));
  const staleWords = await db.word.findMany({
    where: { courseId, id: { notIn: [...keepWordIds] } },
    include: { _count: { select: { reviews: true } } },
  });
  const keptForHistory = new Map<string, string>(); // term -> stale id
  for (const word of staleWords) {
    // Never silently delete a word carrying SRS history.
    if (word._count.reviews > 0) {
      console.warn(`[${course.code}] keeping removed word "${word.term}" (${word._count.reviews} reviews)`);
      keptForHistory.set(word.term, word.id);
      continue;
    }
    await db.word.delete({ where: { id: word.id } });
  }

  // A row kept for its history still holds its (courseId, term) pair. If the
  // course now wants that same term under a different id, we cannot write it
  // without either losing the history or violating the constraint — that is a
  // deliberate migration decision, not something to paper over silently.
  const blocked = built.words.filter((word) => {
    const staleId = keptForHistory.get(word.term);
    return staleId !== undefined && staleId !== word.id;
  });
  if (blocked.length) {
    const detail = blocked
      .map((word) => `"${word.term}" (${keptForHistory.get(word.term)} -> ${word.id})`)
      .join(", ");
    throw new Error(
      `[${course.code}] ${blocked.length} word(s) changed id but have review history: ${detail}. ` +
        `Migrate WordReview.wordId to the new ids, or accept the reset, then re-run the seed.`
    );
  }

  for (const word of built.words) {
    await db.word.upsert({
      where: { id: word.id },
      update: { courseId, term: word.term, translation: word.translation },
      create: { id: word.id, courseId, term: word.term, translation: word.translation },
    });
  }

  // --- structure: upsert sections/units/lessons/challenges in place ---
  const keepSectionIds = new Set<string>();
  const keepUnitIds = new Set<string>();
  const keepLessonIds = new Set<string>();

  for (const section of built.sections) {
    keepSectionIds.add(section.id);
    const sectionFields = {
      courseId,
      level: section.level,
      fillBlank: section.fillBlank,
      title: section.title,
      description: section.description,
      order: section.order,
    };
    await db.section.upsert({
      where: { id: section.id },
      update: sectionFields,
      create: { id: section.id, ...sectionFields },
    });

    for (const unit of section.units) {
      keepUnitIds.add(unit.id);
      const unitFields = {
        sectionId: section.id,
        title: unit.title,
        description: unit.description,
        order: unit.order,
      };
      await db.unit.upsert({
        where: { id: unit.id },
        update: unitFields,
        create: { id: unit.id, ...unitFields },
      });

      for (const lesson of unit.lessons) {
        keepLessonIds.add(lesson.id);
        await db.lesson.upsert({
          where: { id: lesson.id },
          update: { unitId: unit.id, title: lesson.title, order: lesson.order },
          create: { id: lesson.id, unitId: unit.id, title: lesson.title, order: lesson.order },
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
  await pruneStale(courseId, keepSectionIds, keepUnitIds, keepLessonIds, ctx.code);
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
  // Dev-only courses (isAvailable: false) are fixtures. `isAvailable` gates the
  // picker and /api/course/active, but nothing stopped the seed itself from
  // writing fixture content straight into the production database. Enforce it
  // here so the invariant is real rather than assumed. `order` still comes from
  // the full course list, so skipping one never renumbers the others.
  const isProduction = process.env.NODE_ENV === "production";

  for (const [i, course] of courses.entries()) {
    if (isProduction && !course.isAvailable) {
      console.log(`Skipping dev-only course "${course.code}" (isAvailable: false) in production`);
      continue;
    }
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
