import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
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
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const userId = sessionUser.id;

  const { lessonId } = await params;
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { failedWordIds, correctWordIds, mistakes } = parsed.data;

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } });
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const user = await getUserState(userId);
  const now = new Date();

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId, lessonId } },
    update: { completed: true, completedAt: now },
    create: { userId, lessonId, completed: true, completedAt: now },
  });

  await applySrsResults(
    userId,
    [
      ...failedWordIds.map((wordId) => ({ wordId, correct: false })),
      ...correctWordIds.map((wordId) => ({ wordId, correct: true })),
    ],
    now
  );

  const perfect = mistakes === 0 && failedWordIds.length === 0;
  const xpEarned = XP_PER_LESSON + (perfect ? XP_PERFECT_BONUS : 0);
  const firstActivityToday = user.lastActiveDate !== todayStr(now);
  const streakCount = nextStreak(user.lastActiveDate, user.streakCount, now);

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
