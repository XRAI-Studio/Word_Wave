import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { nextStreak, todayStr, XP_PER_REVIEW_WORD } from "@/lib/gamification";
import { applyCompletionRewards } from "@/lib/rewards";
import { applySrsResults } from "@/lib/review-service";
import { getUserState } from "@/lib/user-service";

const bodySchema = z.object({
  results: z.array(z.object({ wordId: z.string(), correct: z.boolean() })),
});

export async function POST(req: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const userId = sessionUser.id;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { results } = parsed.data;

  const user = await getUserState(userId);
  const now = new Date();

  await applySrsResults(userId, results, now);

  const xpEarned = results.filter((r) => r.correct).length * XP_PER_REVIEW_WORD;
  const firstActivityToday = user.lastActiveDate !== todayStr(now);
  const streakCount = results.length
    ? nextStreak(user.lastActiveDate, user.streakCount, now)
    : user.streakCount;

  await db.user.update({
    where: { id: userId },
    data: {
      xp: { increment: xpEarned },
      streakCount,
      ...(results.length ? { lastActiveDate: todayStr(now) } : {}),
    },
  });

  // Reviews never cost hearts.
  const rewards = results.length
    ? await applyCompletionRewards({
        userId,
        kind: "review",
        xpEarned,
        perfect: false,
        wordsReviewed: results.length,
        streakCount,
        firstActivityToday,
        now,
      })
    : { gemsEarned: 0, questsCompleted: [], achievementsUnlocked: [] };

  const updated = await db.user.findUniqueOrThrow({ where: { id: userId } });

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
