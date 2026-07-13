import { db } from "@/lib/db";
import { reconcileStreak } from "@/lib/gamification";
import type { UserDTO } from "@/lib/types";

// Fetch a user's game state, lazily applying freeze-aware streak
// reconciliation. Persists only when something actually changed.
export async function getUserState(userId: string, now = new Date()): Promise<UserDTO> {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });

  const streak = reconcileStreak(user.lastActiveDate, user.streakCount, user.streakFreezes, now);

  const changed =
    streak.streakCount !== user.streakCount ||
    streak.streakFreezes !== user.streakFreezes ||
    streak.lastActiveDate !== user.lastActiveDate;

  if (changed) {
    await db.user.update({
      where: { id: userId },
      data: {
        streakCount: streak.streakCount,
        streakFreezes: streak.streakFreezes,
        lastActiveDate: streak.lastActiveDate,
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
    gems: user.gems,
    streakFreezes: streak.streakFreezes,
  };
}
