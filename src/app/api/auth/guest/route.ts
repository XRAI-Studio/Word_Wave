import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";

// Start a throwaway guest session. Guest accounts are deleted on logout;
// this also sweeps guests whose sessions have all expired.
export async function POST() {
  await db.user.deleteMany({
    where: { isGuest: true, sessions: { none: { expiresAt: { gt: new Date() } } } },
  });

  const user = await db.user.create({
    data: {
      email: `guest-${randomBytes(8).toString("hex")}@guest.local`,
      displayName: "Guest",
      isGuest: true,
    },
  });
  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
