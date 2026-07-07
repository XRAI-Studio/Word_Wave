import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { nextStreak, todayStr, XP_PER_REVIEW_WORD } from "@/lib/gamification";
import { applyCompletionRewards } from "@/lib/rewards";
import { applySrsResults } from "@/lib/review-service";
import { getLocalUser, LOCAL_USER_ID } from "@/lib/user-service";

const bodySchema = z.object({
  results: z.array(z.object({ wordId: z.string(), correct: z.boolean() })),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
  const { results } = parsed.data;

  const user = await getLocalUser();
  const now = new Date();

  await applySrsResults(LOCAL_USER_ID, results, now);

  const xpEarned = results.filter((r) => r.correct).length * XP_PER_REVIEW_WORD;
  const firstActivityToday = user.lastActiveDate !== todayStr(now);
  const streakCount = results.length
    ? nextStreak(user.lastActiveDate, user.streakCount, now)
    : user.streakCount;

  await db.user.update({
    where: { id: LOCAL_USER_ID },
    data: {
      xp: { increment: xpEarned },
      streakCount,
      ...(results.length ? { lastActiveDate: todayStr(now) } : {}),
    },
  });

  // Reviews never cost hearts.
  const rewards = results.length
    ? await applyCompletionRewards({
        kind: "review",
        xpEarned,
        perfect: false,
        wordsReviewed: results.length,
        streakCount,
        firstActivityToday,
        now,
      })
    : { gemsEarned: 0, questsCompleted: [], achievementsUnlocked: [] };

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
