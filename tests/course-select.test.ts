import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { selectCourse } from "@/lib/course-select";
import { createLeaveGuard, HOME, LEAVE_DEADLINE_MS } from "@/lib/leave-guard";

function setup(delayMs: number, status = 200) {
  const home = vi.fn();
  const guard = createLeaveGuard({ target: null, navigate: home });
  const toLearn = vi.fn();
  const post = vi.fn(
    (code: string) =>
      new Promise<Response>((r) => setTimeout(() => r(new Response(JSON.stringify({ code }), { status })), delayMs))
  );
  const pick = () => selectCourse("la", { guard, post, navigate: toLearn });
  return { guard, home, toLearn, post, pick };
}

describe("course selection and Return to Home Room (Codex WW-HR-002)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("enters the path once the course is set", async () => {
    const { toLearn, pick } = setup(100);
    const result = pick();
    await vi.advanceTimersByTimeAsync(100);
    await expect(result).resolves.toBe("switched");
    expect(toLearn).toHaveBeenCalledWith("/learn");
  });

  it("stays put when the write fails", async () => {
    const { toLearn, pick } = setup(100, 500);
    const result = pick();
    await vi.advanceTimersByTimeAsync(100);
    await expect(result).resolves.toBe("failed");
    expect(toLearn).not.toHaveBeenCalled();
  });

  it("a delayed selection, then Home Room: waits for the write, then only Home Room navigates", async () => {
    const { guard, home, toLearn, pick } = setup(1200);
    const result = pick();
    void guard.depart(HOME);
    await vi.advanceTimersByTimeAsync(1199);
    expect(home).not.toHaveBeenCalled(); // the write is still going
    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toBe("leaving");
    expect(toLearn).not.toHaveBeenCalled(); // no /learn over the Home Room navigation
    expect(home).toHaveBeenCalledWith(HOME);
  });

  it("a write slower than 2 s holds Home Room for 2 s only, and never navigates after", async () => {
    const { guard, home, toLearn, pick } = setup(4000); // ends before a stall would be declared (5 s)
    const result = pick();
    void guard.depart(HOME);
    await vi.advanceTimersByTimeAsync(LEAVE_DEADLINE_MS);
    expect(home).toHaveBeenCalledWith(HOME);
    await vi.advanceTimersByTimeAsync(2000);
    await expect(result).resolves.toBe("leaving");
    expect(toLearn).not.toHaveBeenCalled();
  });

  it("no course change starts once a departure has begun", async () => {
    const { guard, post, toLearn, pick } = setup(100);
    void guard.depart(HOME);
    await expect(pick()).resolves.toBe("leaving");
    expect(post).not.toHaveBeenCalled();
    expect(toLearn).not.toHaveBeenCalled();
  });
});
