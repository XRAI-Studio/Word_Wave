import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveCourse } from "@/lib/auth";
import { authFailure, expectedUserMismatch } from "@/lib/api-errors";
import { awardOutcome, SKIPPED, withUnlock, type AwardOutcome } from "@/lib/completion";
import { db } from "@/lib/db";
import { FIRST_LESSON_ACHIEVEMENT, portalFor } from "@/lib/portal";
import { completeLesson, publishSummary, recordOutcome } from "@/lib/progress-service";

const bodySchema = z.object({
  failedWordIds: z.array(z.string()),
  correctWordIds: z.array(z.string()),
  mistakes: z.number().int().min(0).max(100).default(0),
  // Created once per quiz in the browser and kept across retries (criterion 14's
  // transition covers two different quizzes; this covers one quiz sent twice).
  submissionId: z.string().uuid(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  let signedIn;
  try {
    signedIn = await requireActiveCourse();
  } catch (err) {
    return authFailure(err);
  }
  const { user, course, token } = signedIn;
  const mismatch = expectedUserMismatch(req, user.id);
  if (mismatch) return mismatch;

  const { lessonId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { failedWordIds, correctWordIds, submissionId } = parsed.data;

  // Gate the lesson to the active course. This is also the race guard: if the
  // learner switched course mid-lesson, the lesson no longer matches the active
  // course and completion is rejected (no award under the wrong course).
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { unit: { select: { section: { select: { courseId: true } } } } },
  });
  if (!lesson || lesson.unit.section.courseId !== course.id) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Only feed the SRS with words that actually belong to the active course —
  // never let a client mutate another course's review schedule.
  const submittedIds = [...new Set([...failedWordIds, ...correctWordIds])];
  const owned = new Set(
    (
      await db.word.findMany({
        where: { courseId: course.id, id: { in: submittedIds } },
        select: { id: true },
      })
    ).map((w) => w.id)
  );
  const results = [
    ...failedWordIds.filter((id) => owned.has(id)).map((wordId) => ({ wordId, correct: false })),
    ...correctWordIds.filter((id) => owned.has(id)).map((wordId) => ({ wordId, correct: true })),
  ];

  // Progress and SRS commit first; the ledger is credited afterwards, and a portal
  // failure leaves the learner's progress in place.
  const applied = await completeLesson(user.id, lessonId, results, submissionId);
  if (applied.duplicate) {
    return NextResponse.json({ duplicate: true, firstCompletion: false, award: applied.recorded ?? SKIPPED });
  }
  const { firstCompletion } = applied;

  const portal = portalFor();
  const who = { token, userId: user.id };
  let award: AwardOutcome = SKIPPED;
  if (firstCompletion) {
    award = awardOutcome(await portal.award(who, "lesson_complete", { lessonId, course: course.code }));
    if (award.result) {
      award = { ...award, result: withUnlock(award.result, await portal.unlock(who, FIRST_LESSON_ACHIEVEMENT)) };
    }
  }
  await recordOutcome(user.id, submissionId, award);
  await publishSummary(portal, who);

  return NextResponse.json({ firstCompletion, award });
}
