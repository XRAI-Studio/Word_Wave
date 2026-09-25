import { describe, expect, it, vi } from "vitest";

// auth.ts imports next/headers and the database client; neither is used by these units.
vi.mock("next/headers", () => ({ headers: vi.fn() }));
vi.mock("@/lib/db", () => ({ db: {} }));

import {
  courseErrorResponse,
  DEV_EXPIRED_COOKIE,
  NoActiveCourseError,
  PendingError,
  portalRedirectFor,
  readSession,
  UnauthorizedError,
} from "@/lib/auth";
import { expectedUserMismatch } from "@/lib/api-errors";
import type { SessionResult } from "@/lib/session";

const DEV = { NODE_ENV: "development", NEXT_PUBLIC_TS_KIT: "mock" };
const PROD = { NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "https://sb.example" };
const okSession: SessionResult = { ok: true, sub: "u1", approved: true, displayName: "Ana" };

function sessionCookie(accessToken: string): string {
  const value = "base64-" + Buffer.from(JSON.stringify({ access_token: accessToken })).toString("base64url");
  return `sb-ref-auth-token=${value}`;
}

describe("readSession", () => {
  it("returns the accepted access token outside the mock", async () => {
    const verify = vi.fn(async () => okSession);
    const cookie = sessionCookie("jwt-abc");
    const { session, token } = await readSession(cookie, PROD, verify);
    expect(session).toEqual(okSession);
    expect(token).toBe("jwt-abc");
    expect(verify).toHaveBeenCalledWith(cookie, { env: PROD });
  });

  it("has no token in the mock session", async () => {
    const { token } = await readSession(null, DEV, vi.fn(async () => okSession));
    expect(token).toBeNull();
  });

  it("treats the dev-expired cookie as an invalid session in dev only", async () => {
    const verify = vi.fn(async () => okSession);
    const cookie = `${DEV_EXPIRED_COOKIE}=1`;
    expect((await readSession(cookie, DEV, verify)).session).toEqual({ ok: false, reason: "invalid" });
    expect(verify).not.toHaveBeenCalled();
    expect((await readSession(cookie, { ...DEV, NODE_ENV: "production" }, verify)).session).toEqual(okSession);
  });

  it("carries no token for a failed session", async () => {
    const failed: SessionResult = { ok: false, reason: "invalid" };
    const { token } = await readSession(sessionCookie("x"), PROD, vi.fn(async () => failed));
    expect(token).toBeNull();
  });
});

describe("error mapping", () => {
  it("maps the auth and course errors to 401, 403 and 409", () => {
    expect(courseErrorResponse(new UnauthorizedError())).toEqual({ status: 401, error: "Not signed in" });
    expect(courseErrorResponse(new PendingError())).toEqual({ status: 403, error: "pending" });
    expect(courseErrorResponse(new NoActiveCourseError())).toEqual({ status: 409, error: "no-active-course" });
    expect(courseErrorResponse(new Error("boom"))).toBeNull();
  });

  it("sends server components to the portal login or waiting page", () => {
    expect(portalRedirectFor(new UnauthorizedError(), "https://wordwave.travelschooling.com")).toBe(
      "https://class.travelschooling.com/login?next=https%3A%2F%2Fwordwave.travelschooling.com%2F"
    );
    expect(portalRedirectFor(new PendingError(), "https://wordwave.travelschooling.com")).toBe(
      "https://class.travelschooling.com/waiting"
    );
    expect(portalRedirectFor(new NoActiveCourseError(), "x")).toBeNull();
  });
});

describe("expected-user check on resubmission (criterion 21, WW-P5-007)", () => {
  const req = (h?: string) =>
    new Request("http://x/api/review/complete", {
      method: "POST",
      headers: h ? { "X-WordWave-Expect-User": h } : {},
    });

  it("answers 409 when the named learner is not the verified one", async () => {
    const res = expectedUserMismatch(req("learner-a"), "learner-b");
    expect(res?.status).toBe(409);
    expect(await res?.json()).toEqual({ error: "user-mismatch" });
  });

  it("lets a matching or absent header through", () => {
    expect(expectedUserMismatch(req("learner-a"), "learner-a")).toBeNull();
    expect(expectedUserMismatch(req(), "learner-a")).toBeNull();
  });
});
