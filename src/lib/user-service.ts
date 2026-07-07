import { db } from "@/lib/db";
import { reconcileStreak, regenHearts } from "@/lib/gamification";
import type { UserDTO } from "@/lib/types";

export const LOCAL_USER_ID = "local";

// Fetch (or create) the single local user, lazily applying heart regeneration
// and freeze-aware streak reconciliation. Persists only when something
// actually changed.
export async function getLocalUser(now = new Date()): Promise<UserDTO> {
  const user = await db.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {},
    create: { id: LOCAL_USER_ID },
  });

  const streak = reconcileStreak(user.lastActiveDate, user.streakCount, user.streakFreezes, now);
  const hearts = regenHearts(user.hearts, user.heartsUpdatedAt, now);

  const changed =
    streak.streakCount !== user.streakCount ||
    streak.streakFreezes !== user.streakFreezes ||
    streak.lastActiveDate !== user.lastActiveDate ||
    hearts.hearts !== user.hearts;

  if (changed) {
    await db.user.update({
      where: { id: LOCAL_USER_ID },
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
    xp: user.xp,
    streakCount: streak.streakCount,
    lastActiveDate: streak.lastActiveDate,
    hearts: hearts.hearts,
    gems: user.gems,
    streakFreezes: streak.streakFreezes,
  };
}
