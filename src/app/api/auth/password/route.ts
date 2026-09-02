import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { SESSION_COOKIE, getSessionUser, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

// Bounds mirror the register route so a password that can be set can be changed.
const bodySchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(200),
});

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  // Guests and Google-only accounts have no password to compare against, and
  // bcrypt.compareSync throws on a null hash. Setting a first password on a
  // Google account is a separate feature, not this one.
  if (!user.passwordHash) {
    return NextResponse.json(
      {
        error: user.isGuest
          ? "Guest sessions have no password. Create an account to set one."
          : "This account signs in with Google, so it has no password to change.",
      },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter your current password and a new one of at least 8 characters." },
      { status: 400 }
    );
  }

  if (!verifyPassword(parsed.data.currentPassword, user.passwordHash)) {
    return NextResponse.json({ error: "That current password isn't right." }, { status: 400 });
  }

  if (verifyPassword(parsed.data.newPassword, user.passwordHash)) {
    return NextResponse.json(
      { error: "That's already your password — choose a different one." },
      { status: 400 }
    );
  }

  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(parsed.data.newPassword) },
  });

  // Changing a password should sign out anywhere else it was used, while
  // keeping the session that made the change logged in.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await db.session.deleteMany({
    where: { userId: user.id, ...(token ? { NOT: { token } } : {}) },
  });

  return NextResponse.json({ ok: true });
}
