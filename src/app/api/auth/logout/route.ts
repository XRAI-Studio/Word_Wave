import { NextResponse } from "next/server";
import { destroySession, getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const user = await getSessionUser();
  await destroySession();
  // Guest accounts are throwaway — wipe the user and all progress (cascades).
  if (user?.isGuest) {
    await db.user.delete({ where: { id: user.id } }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}
