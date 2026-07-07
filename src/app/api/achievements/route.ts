import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LOCAL_USER_ID } from "@/lib/user-service";

// Keys the local user has unlocked (definitions live in rewards-defs.ts,
// which the client imports directly).
export async function GET() {
  const rows = await db.achievement.findMany({
    where: { userId: LOCAL_USER_ID },
    orderBy: { unlockedAt: "asc" },
  });
  return NextResponse.json({
    unlocked: rows.map((r) => ({ key: r.key, unlockedAt: r.unlockedAt })),
  });
}
