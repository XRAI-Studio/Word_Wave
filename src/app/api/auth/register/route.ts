import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

const bodySchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(200),
  displayName: z.string().trim().min(1).max(60),
});

export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid email, a display name, and a password of at least 8 characters." },
      { status: 400 }
    );
  }
  const email = parsed.data.email.toLowerCase();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "An account with that email already exists — try logging in." },
      { status: 409 }
    );
  }

  const user = await db.user.create({
    data: {
      email,
      passwordHash: hashPassword(parsed.data.password),
      displayName: parsed.data.displayName,
    },
  });
  await createSession(user.id);

  return NextResponse.json({ ok: true });
}
