import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  MAX_HEARTS,
  nextStreak,
  todayStr,
  XP_PER_LESSON,
  XP_PERFECT_BONUS,
} from "@/lib/gamification";
import { applyCompletionRewards } from "@/lib/rewards";
import { applySrsResults } from "@/lib/review-service";
import { getLocalUser, LOCAL_USER_ID } from "@/lib/user-service";

const bodySchema = z.object({
  failedWordIds: z.array(z.string()),
  correctWordIds: z.array(z.string()),
  mistakes: z.number().int().min(0).max(100).default(0),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
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

  const user = await getLocalUser();
  const now = new Date();

  await db.lessonProgress.upsert({
    where: { userId_lessonId: { userId: LOCAL_USER_ID, lessonId } },
    update: { completed: true, completedAt: now },
    create: { userId: LOCAL_USER_ID, lessonId, completed: true, completedAt: now },
  });

  await applySrsResults(
    LOCAL_USER_ID,
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

  // Soft hearts: mistakes cost hearts (floored at 0) but never block anything.
  // user.hearts is already regen-adjusted by getLocalUser; restart the regen
  // timer when a full set takes its first loss.
  const hearts = Math.max(0, user.hearts - mistakes);
  await db.user.update({
    where: { id: LOCAL_USER_ID },
    data: {
      xp: { increment: xpEarned },
      streakCount,
      lastActiveDate: todayStr(now),
      hearts,
      ...(user.hearts >= MAX_HEARTS && hearts < MAX_HEARTS ? { heartsUpdatedAt: now } : {}),
    },
  });

  const rewards = await applyCompletionRewards({
    kind: "lesson",
    xpEarned,
    perfect,
    wordsReviewed: 0,
    streakCount,
    firstActivityToday,
    now,
  });

  const updated = await db.user.findUniqueOrThrow({ where: { id: LOCAL_USER_ID } });

  return NextResponse.json({
    xpEarned,
    xp: updated.xp,
    streakCount: updated.streakCount,
    hearts: updated.hearts,
    gems: updated.gems,
    gemsEarned: rewards.gemsEarned,
    questsCompleted: rewards.questsCompleted,
    achievementsUnlocked: rewards.achievementsUnlocked,
  });
}
