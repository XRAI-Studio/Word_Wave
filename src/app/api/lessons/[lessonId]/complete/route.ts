import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { nextStreak, todayStr, XP_PER_LESSON } from "@/lib/gamification";
import { applySrsResults } from "@/lib/review-service";
import { getLocalUser, LOCAL_USER_ID } from "@/lib/user-service";

const bodySchema = z.object({
  failedWordIds: z.array(z.string()),
  correctWordIds: z.array(z.string()),
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
  const { failedWordIds, correctWordIds } = parsed.data;

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

  const streakCount = nextStreak(user.lastActiveDate, user.streakCount, now);
  const updated = await db.user.update({
    where: { id: LOCAL_USER_ID },
    data: {
      xp: { increment: XP_PER_LESSON },
      streakCount,
      lastActiveDate: todayStr(now),
    },
  });

  return NextResponse.json({
    xpEarned: XP_PER_LESSON,
    xp: updated.xp,
    streakCount: updated.streakCount,
  });
}
