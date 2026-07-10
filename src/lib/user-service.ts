import { db } from "@/lib/db";
import { reconcileStreak, regenHearts } from "@/lib/gamification";
import type { UserDTO } from "@/lib/types";

// Fetch a user's game state, lazily applying heart regeneration and
// freeze-aware streak reconciliation. Persists only when something
// actually changed.
export async function getUserState(userId: string, now = new Date()): Promise<UserDTO> {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  const streak = reconcileStreak(user.lastActiveDate, user.streakCount, user.streakFreezes, now);
  const hearts = regenHearts(user.hearts, user.heartsUpdatedAt, now);

  const changed =
    streak.streakCount !== user.streakCount ||
    streak.streakFreezes !== user.streakFreezes ||
    streak.lastActiveDate !== user.lastActiveDate ||
    hearts.hearts !== user.hearts;

  if (changed) {
    await db.user.update({
      where: { id: userId },
      data: {
        streakCount: streak.streakCount,
        streakFreezes: streak.streakFreezes,
        lastActiveDate: streak.lastActiveDate,
        hearts: hearts.hearts,
        heartsUpdatedAt: hearts.heartsUpdatedAt,
      },
    });
  }

  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    isGuest: user.isGuest,
    createdAt: user.createdAt.toISOString(),
    lessonsCompleted: user.lessonsCompleted,
    xp: user.xp,
    streakCount: streak.streakCount,
    lastActiveDate: streak.lastActiveDate,
    hearts: hearts.hearts,
    gems: user.gems,
    streakFreezes: streak.streakFreezes,
  };
}
