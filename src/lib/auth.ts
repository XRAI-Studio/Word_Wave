import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "lingoduo_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

// Creates a DB-backed session and sets the cookie. Must be called from a
// Route Handler or Server Function (cookie writes are not allowed elsewhere).
export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.session.create({ data: { token, userId, expiresAt } });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session.deleteMany({ where: { token } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

// Resolves the logged-in user from the session cookie, or null.
export async function getSessionUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { token } });
    return null;
  }
  return session.user;
}

export class UnauthorizedError extends Error {}

// For API routes: the current user or a thrown UnauthorizedError the route
// converts to a 401.
export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError("Not logged in");
  return user;
}
