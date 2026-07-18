import { NextResponse } from "next/server";
import { z } from "zod";
import { courseErrorResponse, requireActiveCourse } from "@/lib/auth";
import { db } from "@/lib/db";
import { nextStreak, todayStr, XP_PER_LESSON, XP_PERFECT_BONUS } from "@/lib/gamification";
import { applyCompletionRewards } from "@/lib/rewards";
import { applySrsResults } from "@/lib/review-service";
import { getUserState } from "@/lib/user-service";

const bodySchema = z.object({
  failedWordIds: z.array(z.string()),
  correctWordIds: z.array(z.string()),
  mistakes: z.number().int().min(0).max(100).default(0),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  let user, course;
  try {
    ({ user, course } = await requireActiveCourse());
  } catch (err) {
    const mapped = courseErrorResponse(err);
    if (mapped) return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    throw err;
  }
  const userId = user.id;

  const { lessonId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { failedWordIds, correctWordIds, mistakes } = parsed.data;

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
  const failed = failedWordIds.filter((id) => owned.has(id));
  const correct = correctWordIds.filter((id) => owned.has(id));

  const state = await getUserState(userId);
  const now = new Date();

  // Award XP/gems/streak only on the first completion of this lesson; replays
  // still refresh the SRS but don't double-award.
  const existing = await db.lessonProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
  });
  const firstCompletion = !existing?.completed;

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: true, completedAt: now },
    create: { userId, lessonId, completed: true, completedAt: now },
  });

  await applySrsResults(
    userId,
    [
      ...failed.map((wordId) => ({ wordId, correct: false })),
      ...correct.map((wordId) => ({ wordId, correct: true })),
    ],
    now
  );

  if (!firstCompletion) {
    const current = await db.user.findUniqueOrThrow({ where: { id: userId } });
    return NextResponse.json({
      xpEarned: 0,
      xp: current.xp,
      streakCount: current.streakCount,
      gems: current.gems,
      gemsEarned: 0,
      questsCompleted: [],
      achievementsUnlocked: [],
    });
  }

  const perfect = mistakes === 0 && failed.length === 0;
  const xpEarned = XP_PER_LESSON + (perfect ? XP_PERFECT_BONUS : 0);
  const firstActivityToday = state.lastActiveDate !== todayStr(now);
  const streakCount = nextStreak(state.lastActiveDate, state.streakCount, now);

  await db.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpEarned },
      streakCount,
      lastActiveDate: todayStr(now),
    },
  });

  const rewards = await applyCompletionRewards({
    userId,
    kind: "lesson",
    xpEarned,
    perfect,
    wordsReviewed: 0,
    streakCount,
    firstActivityToday,
    now,
  });

  const updated = await db.user.findUniqueOrThrow({ where: { id: userId } });

  return NextResponse.json({
    xpEarned,
    xp: updated.xp,
    streakCount: updated.streakCount,
    gems: updated.gems,
    gemsEarned: rewards.gemsEarned,
    questsCompleted: rewards.questsCompleted,
    achievementsUnlocked: rewards.achievementsUnlocked,
  });
}
