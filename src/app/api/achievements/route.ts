import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

// Keys the current user has unlocked (definitions live in rewards-defs.ts,
// which the client imports directly).
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const rows = await db.achievement.findMany({
    where: { userId: sessionUser.id },
    orderBy: { unlockedAt: "asc" },
  });
  return NextResponse.json({
    unlocked: rows.map((r) => ({ key: r.key, unlockedAt: r.unlockedAt })),
  });
}
