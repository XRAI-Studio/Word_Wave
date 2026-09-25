import { describe, expect, it, vi } from "vitest";
import { createMockPortal, createPortalClient, portalFor, XP_EVENTS, FIRST_LESSON_ACHIEVEMENT } from "@/lib/portal";

const who = { token: "tok-123", userId: "u1" };
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
const totals = { awarded_xp: 10, xp: 10, gems: 0, level: 1, streak: 1, level_up: false, new_achievements: [] };

function client(fetchImpl: typeof fetch, log = vi.fn()) {
  return { c: createPortalClient({ supabaseUrl: "https://sb.example", anonKey: "anon-key", fetch: fetchImpl, log, timeoutMs: 50 }), log };
}

describe("portal client (work order criterion 13)", () => {
  it("awards with the learner's bearer token and the anon apikey, game wordwave", async () => {
    const f = vi.fn(async () => ok(totals));
    const { c } = client(f as unknown as typeof fetch);
    await expect(c.award(who, "lesson_complete", { lessonId: "L1", course: "es" })).resolves.toEqual(totals);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://sb.example/rest/v1/rpc/award");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ apikey: "anon-key", Authorization: "Bearer tok-123", "Content-Type": "application/json" });
    expect(JSON.parse(init.body as string)).toEqual({ p_game: "wordwave", p_event: "lesson_complete", p_detail: { lessonId: "L1", course: "es" } });
  });

  it("unlocks by achievement id", async () => {
    const f = vi.fn(async () => ok(totals));
    const { c } = client(f as unknown as typeof fetch);
    await c.unlock(who, FIRST_LESSON_ACHIEVEMENT);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://sb.example/rest/v1/rpc/unlock");
    expect(JSON.parse(init.body as string)).toEqual({ p_achievement: "wordwave-first-lesson" });
  });

  it("saves the launcher summary with the state's rev as p_rev", async () => {
    const f = vi.fn(async () => ok(true));
    const { c } = client(f as unknown as typeof fetch);
    await expect(c.saveSummary(who, { rev: 7 }, { headline: "3 lessons done in Spanish", percent: 1 })).resolves.toBe(true);
    const [url, init] = f.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://sb.example/rest/v1/rpc/save_progress");
    expect(JSON.parse(init.body as string)).toEqual({
      p_game: "wordwave",
      p_state: { rev: 7 },
      p_summary: { headline: "3 lessons done in Spanish", percent: 1 },
      p_rev: 7,
    });
  });

  it.each([
    ["a non-2xx answer", async () => new Response("capped", { status: 400 })],
    ["a network error", async () => { throw new TypeError("fetch failed"); }],
    ["a timeout", (_u: string, init: RequestInit) => new Promise<Response>((_, reject) => init.signal!.addEventListener("abort", () => reject(init.signal!.reason)))],
  ])("resolves null and logs on %s, never throws", async (_label, impl) => {
    const { c, log } = client(vi.fn(impl) as unknown as typeof fetch);
    await expect(c.award(who, "review_session", {})).resolves.toBeNull();
    expect(log).toHaveBeenCalledOnce();
  });

  it("makes no request without a token", async () => {
    const f = vi.fn();
    const { c } = client(f as unknown as typeof fetch);
    await expect(c.award({ token: null, userId: "u1" }, "lesson_complete", {})).resolves.toBeNull();
    expect(f).not.toHaveBeenCalled();
  });
});

describe("portalFor", () => {
  it("uses the in-memory mock only in the dev mock session", async () => {
    const f = vi.spyOn(globalThis, "fetch");
    const mock = portalFor({ NEXT_PUBLIC_TS_KIT: "mock", NODE_ENV: "development" });
    await expect(mock.award({ token: null, userId: "m" }, "lesson_complete", {})).resolves.toMatchObject({ awarded_xp: 10 });
    expect(f).not.toHaveBeenCalled();
    f.mockRestore();
  });

  it("never mocks in production, even with the flag", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(ok(totals));
    const real = portalFor({ NEXT_PUBLIC_TS_KIT: "mock", NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "https://sb.example", SUPABASE_ANON_KEY: "k" });
    await real.award(who, "lesson_complete", {});
    expect(f).toHaveBeenCalledOnce();
    f.mockRestore();
  });

  it("answers null when the production variables are missing", async () => {
    const err = vi.spyOn(console, "error").mockImplementation(() => {});
    const p = portalFor({ NODE_ENV: "production", NEXT_PUBLIC_SUPABASE_URL: "https://sb.example" });
    await expect(p.award(who, "lesson_complete", {})).resolves.toBeNull();
    err.mockRestore();
  });
});

describe("mock portal", () => {
  it("applies the seeded per-day caps and pays the first-lesson gems once", async () => {
    const m = createMockPortal();
    const w = { token: null, userId: "u" };
    for (let i = 0; i < 5; i++) expect((await m.award(w, "review_session", {}))!.awarded_xp).toBe(10);
    expect((await m.award(w, "review_session", {}))!.awarded_xp).toBe(0);
    expect((await m.unlock(w, FIRST_LESSON_ACHIEVEMENT))!.gems).toBe(5);
    expect((await m.unlock(w, FIRST_LESSON_ACHIEVEMENT))!.gems).toBe(5);
    expect(m.totals("u")).toMatchObject({ xp: 50, gems: 5 });
  });

  it("keeps the newest summary: an older rev is refused", async () => {
    const m = createMockPortal();
    const w = { token: null, userId: "u" };
    await m.saveSummary(w, { rev: 2 }, { headline: "latin", percent: 0 });
    await expect(m.saveSummary(w, { rev: 1 }, { headline: "spanish", percent: 0 })).resolves.toBe(false);
    expect(m.summary("u")).toEqual({ rev: 2, summary: { headline: "latin", percent: 0 } });
  });
});

describe("seeded events (class standard rule 3.2)", () => {
  // travelschooling-portal/supabase/seed.sql line 5:
  // ('wordwave', ..., '{"lesson_complete":{"xp":10,"per_day":20},"review_session":{"xp":10,"per_day":5}}', 300)
  // and line 47: 'wordwave-first-lesson'.
  it("sends only the events and achievement the portal seed defines", () => {
    expect(XP_EVENTS).toEqual({ lesson_complete: 10, review_session: 10 });
    expect(FIRST_LESSON_ACHIEVEMENT).toBe("wordwave-first-lesson");
  });
});
