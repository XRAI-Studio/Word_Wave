import { headers } from "next/headers";
import type { Course, User } from "@prisma/client";
import { isMockSession, type SessionEnv } from "@/lib/auth-env";
import { db } from "@/lib/db";
import { extractAccessToken, verifySession, type SessionResult } from "@/lib/session";

/**
 * Identity comes from the portal session only (class standard rules 2.1–2.3). There is no
 * local sign-in: every API route and the main layout verify the portal cookie here, and
 * the learner's `User` row is keyed by the token's `sub`.
 */

export const PORTAL = "https://class.travelschooling.com";

/** Dev-only switch that makes the mock session look expired, so e2e can drive the 401 path. */
export { isMockSession };

export const DEV_EXPIRED_COOKIE = "ww-dev-expired";

export class UnauthorizedError extends Error {}
export class PendingError extends Error {}

// Thrown when a signed-in learner has no (valid) active course — they must pick
// one via the first-run picker before any course-scoped route will serve them.
export class NoActiveCourseError extends Error {}

function devExpired(cookieHeader: string | null, env: SessionEnv): boolean {
  if (!isMockSession(env) || !cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim().startsWith(`${DEV_EXPIRED_COOKIE}=`));
}

export interface VerifiedSession {
  session: SessionResult;
  /** The access token the verifier accepted; null in the mock session. */
  token: string | null;
}

/** Verifies a raw Cookie header. Exported for tests; routes use `requireUser`. */
export async function readSession(
  cookieHeader: string | null,
  env: SessionEnv = process.env,
  verify: typeof verifySession = verifySession,
): Promise<VerifiedSession> {
  if (devExpired(cookieHeader, env)) return { session: { ok: false, reason: "invalid" }, token: null };
  const session = await verify(cookieHeader, { env });
  const token = session.ok && !isMockSession(env) ? extractAccessToken(cookieHeader) : null;
  return { session, token };
}

/** Finds or creates the learner's row, refreshing the display name from the token. */
async function upsertUser(id: string, displayName: string): Promise<User> {
  const existing = await db.user.findUnique({ where: { id } });
  if (!existing) {
    return db.user.upsert({ where: { id }, update: {}, create: { id, displayName } });
  }
  if (existing.displayName !== displayName) {
    return db.user.update({ where: { id }, data: { displayName } });
  }
  return existing;
}

export interface SignedIn {
  user: User;
  token: string | null;
}

/**
 * For API routes: the signed-in learner and their access token, or a thrown
 * UnauthorizedError (401) / PendingError (403). Call it before doing anything else.
 */
export async function requireUser(): Promise<SignedIn> {
  const { session, token } = await readSession((await headers()).get("cookie"));
  if (!session.ok) {
    if (session.reason === "pending") throw new PendingError("Account awaiting approval");
    throw new UnauthorizedError("Not signed in");
  }
  return { user: await upsertUser(session.sub, session.displayName), token };
}

// Central resolution of the learner's active course. EVERY course-aware
// API/layout goes through this so course scoping is never re-implemented per
// route. Throws UnauthorizedError (→401), PendingError (→403), or
// NoActiveCourseError (→409 / redirect to picker).
export async function requireActiveCourse(): Promise<SignedIn & { course: Course }> {
  const signedIn = await requireUser();
  const { user } = signedIn;
  if (!user.activeCourseId) throw new NoActiveCourseError("No active course");
  const course = await db.course.findUnique({ where: { id: user.activeCourseId } });
  if (!course) throw new NoActiveCourseError("Active course not found");
  return { ...signedIn, course };
}

// Maps the auth/course errors to the right HTTP status for API routes.
export function courseErrorResponse(err: unknown): { status: number; error: string } | null {
  if (err instanceof UnauthorizedError) return { status: 401, error: "Not signed in" };
  if (err instanceof PendingError) return { status: 403, error: "pending" };
  if (err instanceof NoActiveCourseError) return { status: 409, error: "no-active-course" };
  return null;
}

/**
 * Where a server component sends a learner whose session failed between the page gate
 * and the render (a token expiring in that window). The layout has no pathname, so the
 * return target is the site root, which lands on /learn.
 */
export function portalRedirectFor(err: unknown, origin: string): string | null {
  if (err instanceof PendingError) return `${PORTAL}/waiting`;
  if (err instanceof UnauthorizedError) return `${PORTAL}/login?next=${encodeURIComponent(`${origin}/`)}`;
  return null;
}

/** The request's own origin, from the forwarded host Vercel (and `next dev`) supply. */
export async function requestOrigin(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "wordwave.travelschooling.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
