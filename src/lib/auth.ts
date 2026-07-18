import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import type { Course, User } from "@prisma/client";
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

// Thrown when a logged-in user has no (valid) active course — they must pick
// one via the first-run picker before any course-scoped route will serve them.
export class NoActiveCourseError extends Error {}

// For API routes: the current user or a thrown UnauthorizedError the route
// converts to a 401.
export async function requireUser(): Promise<User> {
  const user = await getSessionUser();
  if (!user) throw new UnauthorizedError("Not logged in");
  return user;
}

// Central resolution of the session user's active course. EVERY course-aware
// API/layout goes through this so course scoping is never re-implemented per
// route. Throws UnauthorizedError (→401) if logged out, NoActiveCourseError
// (→409 / redirect to picker) if there is no valid active course.
export async function requireActiveCourse(): Promise<{ user: User; course: Course }> {
  const user = await requireUser();
  if (!user.activeCourseId) throw new NoActiveCourseError("No active course");
  const course = await db.course.findUnique({ where: { id: user.activeCourseId } });
  if (!course) throw new NoActiveCourseError("Active course not found");
  return { user, course };
}

// Maps the auth/course errors to the right HTTP status for API routes.
export function courseErrorResponse(err: unknown): { status: number; error: string } | null {
  if (err instanceof UnauthorizedError) return { status: 401, error: "Not logged in" };
  if (err instanceof NoActiveCourseError) return { status: 409, error: "no-active-course" };
  return null;
}
