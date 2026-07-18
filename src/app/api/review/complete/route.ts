import { NextResponse } from "next/server";
import { z } from "zod";
import { courseErrorResponse, requireActiveCourse } from "@/lib/auth";
import { db } from "@/lib/db";
import { nextStreak, todayStr, XP_PER_REVIEW_WORD } from "@/lib/gamification";
import { applyCompletionRewards } from "@/lib/rewards";
import { applySrsResults } from "@/lib/review-service";
import { getUserState } from "@/lib/user-service";

const bodySchema = z.object({
  results: z.array(z.object({ wordId: z.string(), correct: z.boolean() })),
});

export async function POST(req: Request) {
  let sessionUser, course;
  try {
    ({ user: sessionUser, course } = await requireActiveCourse());
  } catch (err) {
    const mapped = courseErrorResponse(err);
    if (mapped) return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    throw err;
  }
  const userId = sessionUser.id;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Drop any results for words outside the active course before touching SRS.
  const owned = new Set(
    (
      await db.word.findMany({
        where: { courseId: course.id, id: { in: parsed.data.results.map((r) => r.wordId) } },
        select: { id: true },
      })
    ).map((w) => w.id)
  );
  const results = parsed.data.results.filter((r) => owned.has(r.wordId));

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
    gems: updated.gems,
    gemsEarned: rewards.gemsEarned,
    questsCompleted: rewards.questsCompleted,
    achievementsUnlocked: rewards.achievementsUnlocked,
  });
}
