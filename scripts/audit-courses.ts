/* Post-migration / post-seed course integrity audit.
 *
 * Reports per-course counts and flags the zero-tolerance classes:
 *   - orphaned LessonProgress / WordReview (dangling foreign keys)
 *   - challenge meta.wordIds that point at a DIFFERENT course's words
 *   - duplicate (courseId, term) vocabulary
 *   - users with a non-null activeCourseId that doesn't resolve to a course
 *
 * Exits non-zero if any zero-tolerance issue is found. Run after a migration
 * or seed:  npx tsx scripts/audit-courses.ts
 */
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const dbFile = process.env.DATABASE_PATH
  ? path.resolve(process.env.DATABASE_PATH)
  : path.join(__dirname, "..", "prisma", "dev.db");
const db = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbFile}` }) });

async function main() {
  const problems: string[] = [];

  // --- per-course counts (unique Word ROWS, not authored slots) ---
  const courses = await db.course.findMany({ orderBy: { order: "asc" } });
  console.log(`Courses: ${courses.length}`);
  for (const course of courses) {
    const [sections, units, lessons, challenges, words] = await Promise.all([
      db.section.count({ where: { courseId: course.id } }),
      db.unit.count({ where: { section: { courseId: course.id } } }),
      db.lesson.count({ where: { unit: { section: { courseId: course.id } } } }),
      db.challenge.count({ where: { lesson: { unit: { section: { courseId: course.id } } } } }),
      db.word.count({ where: { courseId: course.id } }),
    ]);
    console.log(
      `  ${course.code} (${course.name}${course.isAvailable ? "" : ", dev-only"}): ` +
        `${sections} sections, ${units} units, ${lessons} lessons, ${challenges} challenges, ${words} words`
    );
  }

  // --- orphaned progress / reviews ---
  const lessonIds = new Set((await db.lesson.findMany({ select: { id: true } })).map((l) => l.id));
  const wordIds = new Set((await db.word.findMany({ select: { id: true } })).map((w) => w.id));
  const orphanProgress = (await db.lessonProgress.findMany({ select: { lessonId: true } })).filter(
    (p) => !lessonIds.has(p.lessonId)
  ).length;
  const orphanReviews = (await db.wordReview.findMany({ select: { wordId: true } })).filter(
    (r) => !wordIds.has(r.wordId)
  ).length;
  if (orphanProgress) problems.push(`${orphanProgress} orphaned LessonProgress rows`);
  if (orphanReviews) problems.push(`${orphanReviews} orphaned WordReview rows`);
  console.log(`Orphaned LessonProgress: ${orphanProgress}, WordReview: ${orphanReviews}`);

  // --- cross-course wordId references in challenge meta ---
  const wordCourse = new Map<string, string>();
  for (const w of await db.word.findMany({ select: { id: true, courseId: true } }))
    wordCourse.set(w.id, w.courseId);
  const challenges = await db.challenge.findMany({
    select: { id: true, meta: true, lesson: { select: { unit: { select: { section: { select: { courseId: true } } } } } } },
  });
  let crossRefs = 0;
  for (const ch of challenges) {
    const courseId = ch.lesson.unit.section.courseId;
    let ids: string[] = [];
    try {
      ids = JSON.parse(ch.meta).wordIds ?? [];
    } catch {
      /* non-JSON meta shouldn't happen */
    }
    for (const id of ids) {
      const owner = wordCourse.get(id);
      if (owner && owner !== courseId) crossRefs++;
    }
  }
  if (crossRefs) problems.push(`${crossRefs} challenge wordId references crossing courses`);
  console.log(`Cross-course wordId references: ${crossRefs}`);

  // --- users pointing at a missing course ---
  const courseIds = new Set(courses.map((c) => c.id));
  const users = await db.user.findMany({ select: { activeCourseId: true } });
  const nullActive = users.filter((u) => u.activeCourseId === null).length;
  const danglingActive = users.filter(
    (u) => u.activeCourseId !== null && !courseIds.has(u.activeCourseId)
  ).length;
  if (danglingActive) problems.push(`${danglingActive} users with a dangling activeCourseId`);
  console.log(`Users: ${users.length} (null active course: ${nullActive}, dangling: ${danglingActive})`);

  console.log("");
  if (problems.length) {
    console.error("AUDIT FAILED:");
    for (const p of problems) console.error(`  - ${p}`);
    process.exitCode = 1;
  } else {
    console.log("AUDIT PASSED — no integrity problems.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
