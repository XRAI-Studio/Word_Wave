import { Prisma } from "@prisma/client";
import { db, DB_SCHEMA } from "@/lib/db";
import { launcherSummary, type AwardOutcome } from "@/lib/completion";
import { applySrsResults, type WordResult } from "@/lib/review-service";
import type { Learner, LauncherSummary, PortalClient } from "@/lib/portal";

const TX = { timeout: 15_000, maxWait: 5_000 };

/**
 * Serialises one learner's progress writes (WW-INSPECT-004): the SRS reads a word's
 * schedule and writes a new one, so two overlapping submissions touching the same word
 * (a lesson and a review, or two lessons) could each read the old state and the later
 * write would erase the earlier result. Every completion transaction takes this row lock
 * first, in the same order, so they run one after another per learner.
 */
async function lockLearner(tx: Prisma.TransactionClient, userId: string): Promise<void> {
  await tx.$queryRaw`SELECT id FROM ${Prisma.raw(`"${DB_SCHEMA}"."User"`)} WHERE id = ${userId} FOR UPDATE`;
}

/**
 * Records this submission's id for the learner. False means the same quiz was already
 * submitted (a retry after a lost response, or a reload during recovery): the caller then
 * writes nothing and returns the recorded outcome (Codex WW-P5-R3-001).
 */
async function claimSubmission(tx: Prisma.TransactionClient, userId: string, submissionId: string): Promise<boolean> {
  const r = await tx.submission.createMany({ data: [{ userId, id: submissionId }], skipDuplicates: true });
  return r.count === 1;
}

/**
 * A repeat of an already-applied submission. `pending` means the first send is still
 * between its commit and its recorded outcome (its portal call in flight): the caller
 * answers 202 and the browser asks again (Codex WW-P5-R4-001).
 */
export type Duplicate =
  | { duplicate: true; pending: true }
  | { duplicate: true; pending: false; recorded: AwardOutcome };

/**
 * How long a claimed submission may stay without an outcome before it is taken as
 * abandoned (the first request died between its commit and its portal call). It is then
 * finalised as `failed`, never retried: the award RPC is not idempotent, and progress was
 * already committed. The portal call itself times out after 5 s.
 */
export const ABANDONED_AFTER_MS = 60_000;

async function recordedOutcome(tx: Prisma.TransactionClient, userId: string, submissionId: string): Promise<Duplicate> {
  const key = { userId_id: { userId, id: submissionId } };
  const row = await tx.submission.findUniqueOrThrow({ where: key });
  if (row.award) return { duplicate: true, pending: false, recorded: JSON.parse(row.award) as AwardOutcome };
  if (Date.now() - row.createdAt.getTime() < ABANDONED_AFTER_MS) return { duplicate: true, pending: true };
  const failed: AwardOutcome = { status: "failed", result: null };
  await tx.submission.update({ where: key, data: { award: JSON.stringify(failed) } });
  return { duplicate: true, pending: false, recorded: failed };
}

/** Stores the award outcome against the submission, for any repeat of it to report. */
export async function recordOutcome(userId: string, submissionId: string, award: AwardOutcome): Promise<void> {
  await db.submission.update({ where: { userId_id: { userId, id: submissionId } }, data: { award: JSON.stringify(award) } });
}

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
  submissionId: string,
  now = new Date()
): Promise<{ duplicate: false; firstCompletion: boolean } | Duplicate> {
  return db.$transaction(async (tx) => {
    await lockLearner(tx, userId);
    if (!(await claimSubmission(tx, userId, submissionId))) return recordedOutcome(tx, userId, submissionId);
    const inserted = await tx.lessonProgress.createMany({
      data: [{ userId, lessonId, completed: true, completedAt: now }],
      skipDuplicates: true,
    });
    const firstCompletion = inserted.count === 1;
    if (!firstCompletion) {
      await tx.lessonProgress.updateMany({ where: { userId, lessonId }, data: { completedAt: now } });
    }
    await applySrsResults(tx, userId, results, now);
    return { duplicate: false as const, firstCompletion };
  }, TX);
}

/** Applies a review session's SRS results once per submission; returns how many words were scheduled. */
export async function completeReview(
  userId: string,
  results: WordResult[],
  submissionId: string,
  now = new Date()
): Promise<{ duplicate: false; applied: number } | Duplicate> {
  return db.$transaction(async (tx) => {
    await lockLearner(tx, userId);
    if (!(await claimSubmission(tx, userId, submissionId))) return recordedOutcome(tx, userId, submissionId);
    return { duplicate: false as const, applied: await applySrsResults(tx, userId, results, now) };
  }, TX);
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
