import { db } from "@/lib/db";
import { effectiveStreak } from "@/lib/gamification";
import type { UserDTO } from "@/lib/types";

export const LOCAL_USER_ID = "local";

// Fetch (or create) the single local user, lazily applying streak expiry.
// Persists only when something actually changed.
export async function getLocalUser(now = new Date()): Promise<UserDTO> {
  const user = await db.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {},
    create: { id: LOCAL_USER_ID },
  });

  const streak = effectiveStreak(user.lastActiveDate, user.streakCount, now);

  if (streak !== user.streakCount) {
    await db.user.update({
      where: { id: LOCAL_USER_ID },
      data: { streakCount: streak },
    });
  }

  return {
    id: user.id,
    xp: user.xp,
    streakCount: streak,
    lastActiveDate: user.lastActiveDate,
  };
}
