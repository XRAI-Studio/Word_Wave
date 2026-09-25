import { db } from "@/lib/db";
import { launcherSummary } from "@/lib/completion";
import { applySrsResults, type WordResult } from "@/lib/review-service";
import type { Learner, LauncherSummary, PortalClient } from "@/lib/portal";

const TX = { timeout: 15_000, maxWait: 5_000 };

/**
 * Marks a lesson complete and applies its SRS results in one transaction. The first
 * completion is decided by the insert itself (ON CONFLICT DO NOTHING, which leaves the
 * transaction usable, unlike a caught unique violation): of two concurrent submissions
 * exactly one sees `count === 1` (work order criterion 14).
 */
export async function completeLesson(
  userId: string,
  lessonId: string,
  results: WordResult[],
  now = new Date()
): Promise<{ firstCompletion: boolean }> {
  return db.$transaction(async (tx) => {
    const inserted = await tx.lessonProgress.createMany({
      data: [{ userId, lessonId, completed: true, completedAt: now }],
      skipDuplicates: true,
    });
    const firstCompletion = inserted.count === 1;
    if (!firstCompletion) {
      await tx.lessonProgress.updateMany({ where: { userId, lessonId }, data: { completedAt: now } });
    }
    await applySrsResults(tx, userId, results, now);
    return { firstCompletion };
  }, TX);
}

/** Applies a review session's SRS results. */
export async function completeReview(userId: string, results: WordResult[], now = new Date()): Promise<void> {
  await db.$transaction((tx) => applySrsResults(tx, userId, results, now), TX);
}

/**
 * Publishes the launcher tile (criterion 17). The revision is incremented and the
 * snapshot read in one transaction; the increment locks the learner's row, so a later
 * request's snapshot is always taken after an earlier one committed, and revisions are
 * strictly increasing. The portal's `rev` guard then drops any delayed older summary.
 */
export async function publishSummary(
  portal: PortalClient,
  who: Learner
): Promise<{ rev: number; summary: LauncherSummary } | null> {
  const snapshot = await db.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: who.userId },
      data: { summaryRev: { increment: 1 } },
    });
    if (!user.activeCourseId) return null;
    const course = await tx.course.findUnique({ where: { id: user.activeCourseId } });
    if (!course) return null;
    const inCourse = { unit: { section: { courseId: course.id } } };
    const [completedInCourse, lessonsInCourse] = await Promise.all([
      tx.lessonProgress.count({ where: { userId: user.id, completed: true, lesson: inCourse } }),
      tx.lesson.count({ where: inCourse }),
    ]);
    return {
      rev: user.summaryRev,
      summary: launcherSummary({ courseName: course.name, completedInCourse, lessonsInCourse }),
    };
  }, TX);
  if (!snapshot) return null;
  await portal.saveSummary(who, { rev: snapshot.rev }, snapshot.summary);
  return snapshot;
}
