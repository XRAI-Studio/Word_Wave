import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MAX_STREAK_FREEZES, STREAK_FREEZE_COST } from "@/lib/gamification";
import { checkAchievements } from "@/lib/rewards";
import { getUserState } from "@/lib/user-service";

// Buy one streak freeze for gems.
export async function POST() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const user = await getUserState(sessionUser.id);

  if (user.streakFreezes >= MAX_STREAK_FREEZES) {
    return NextResponse.json(
      { error: `You already hold the maximum of ${MAX_STREAK_FREEZES} streak freezes.` },
      { status: 400 }
    );
  }
  if (user.gems < STREAK_FREEZE_COST) {
    return NextResponse.json(
      { error: `A streak freeze costs ${STREAK_FREEZE_COST} gems — you have ${user.gems}.` },
      { status: 400 }
    );
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      gems: { decrement: STREAK_FREEZE_COST },
      streakFreezes: { increment: 1 },
    },
  });

  const achievementsUnlocked = await checkAchievements(user.id);

  return NextResponse.json({
    gems: updated.gems,
    streakFreezes: updated.streakFreezes,
    achievementsUnlocked,
  });
}
