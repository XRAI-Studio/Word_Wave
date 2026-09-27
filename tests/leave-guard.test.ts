import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createLeaveGuard, HOME, LEAVE_DEADLINE_MS } from "@/lib/leave-guard";

/** A stand-in for `window`: records listeners and dispatches to them. */
function fakeWindow() {
  const listeners = new Map<string, Set<(e: Event) => void>>();
  return {
    addEventListener(type: string, fn: (e: Event) => void) {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener(type: string, fn: (e: Event) => void) {
      listeners.get(type)?.delete(fn);
    },
    count(type: string) {
      return listeners.get(type)?.size ?? 0;
    },
    /** Dispatches a beforeunload; true when a listener asked the browser to prompt. */
    beforeUnload() {
      const e = { returnValue: undefined as unknown, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; } };
      for (const fn of listeners.get("beforeunload") ?? []) fn(e as unknown as Event);
      return e.defaultPrevented && e.returnValue === "";
    },
    pageshow(persisted: boolean) {
      for (const fn of listeners.get("pageshow") ?? []) fn({ persisted } as unknown as Event);
    },
  };
}

function setup() {
  const win = fakeWindow();
  const navigate = vi.fn();
  const guard = createLeaveGuard({ target: win, navigate });
  let unsaved = false;
  const unregister = guard.register({ kind: "lesson", hasUnsavedWork: () => unsaved });
  const set = (v: boolean) => {
    unsaved = v;
    guard.refresh();
  };
  return { win, navigate, guard, set, unregister };
}

describe("leave guard (home-room plan, Word Wave)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("goes home to the portal's front door", () => {
    expect(HOME).toBe("https://class.travelschooling.com/");
    expect(LEAVE_DEADLINE_MS).toBe(2000);
  });

  it("reports the registered predicate and its kind", () => {
    const { guard, set, unregister } = setup();
    expect(guard.hasUnsavedWork()).toBe(false);
    expect(guard.unsavedKind()).toBeNull();
    set(true);
    expect(guard.hasUnsavedWork()).toBe(true);
    expect(guard.unsavedKind()).toBe("lesson");
    unregister();
    expect(guard.hasUnsavedWork()).toBe(false);
  });

  it("has no unsaved work and never prompts with nothing registered", () => {
    const win = fakeWindow();
    const guard = createLeaveGuard({ target: win, navigate: vi.fn() });
    guard.refresh();
    expect(guard.hasUnsavedWork()).toBe(false);
    expect(win.count("beforeunload")).toBe(0);
  });

  it("arms beforeunload only while there is unsaved work", () => {
    const { win, guard, set, unregister } = setup();
    expect(win.count("beforeunload")).toBe(0);
    expect(win.beforeUnload()).toBe(false);

    set(true);
    expect(guard.isArmed()).toBe(true);
    expect(win.count("beforeunload")).toBe(1);
    expect(win.beforeUnload()).toBe(true); // preventDefault + returnValue ""

    guard.refresh(); // idempotent: still one listener
    expect(win.count("beforeunload")).toBe(1);

    set(false);
    expect(guard.isArmed()).toBe(false);
    expect(win.count("beforeunload")).toBe(0);
    expect(win.beforeUnload()).toBe(false);

    set(true);
    unregister(); // the quiz unmounts: disarmed
    expect(win.count("beforeunload")).toBe(0);
  });

  it("allowUnload disarms and stays off until resumed", () => {
    const { win, guard, set } = setup();
    set(true);
    guard.allowUnload();
    expect(win.count("beforeunload")).toBe(0);
    guard.refresh();
    expect(win.count("beforeunload")).toBe(0);
    expect(win.beforeUnload()).toBe(false);

    guard.resume();
    expect(win.count("beforeunload")).toBe(1);
    expect(win.beforeUnload()).toBe(true);
  });

  it("re-arms a page restored from the back/forward cache", () => {
    const { win, guard, set } = setup();
    set(true);
    guard.leave("/learn");
    expect(win.count("beforeunload")).toBe(0);
    win.pageshow(false);
    expect(win.count("beforeunload")).toBe(0);
    win.pageshow(true);
    expect(win.count("beforeunload")).toBe(1);
  });

  it("leave disarms first, then navigates", () => {
    const { win, navigate, guard, set } = setup();
    set(true);
    navigate.mockImplementation(() => {
      // The browser would dispatch beforeunload now: it must not prompt.
      expect(win.beforeUnload()).toBe(false);
    });
    guard.leave(HOME);
    expect(navigate).toHaveBeenCalledWith(HOME);
  });

  it("settle resolves at once with nothing tracked", async () => {
    const { guard } = setup();
    await expect(guard.settle()).resolves.toBe(true);
  });

  it("settle waits for tracked promises, fulfilled or rejected", async () => {
    const { guard } = setup();
    let resolveA!: () => void;
    let rejectB!: (e: Error) => void;
    const a = guard.track(new Promise<void>((r) => (resolveA = r)));
    const b = guard.track(new Promise<void>((_, r) => (rejectB = r)));
    b.catch(() => {});
    expect(guard.pendingCount()).toBe(2);

    let done: boolean | undefined;
    void guard.settle().then((v) => (done = v));
    await vi.advanceTimersByTimeAsync(500);
    expect(done).toBeUndefined();
    resolveA();
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toBeUndefined();
    rejectB(new Error("network"));
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toBe(true);
    expect(guard.pendingCount()).toBe(0);
    await a;
  });

  it("settle gives up at the 2 s deadline and keeps the promise tracked", async () => {
    const { guard } = setup();
    guard.track(new Promise<void>(() => {}));
    let done: boolean | undefined;
    void guard.settle().then((v) => (done = v));
    await vi.advanceTimersByTimeAsync(LEAVE_DEADLINE_MS - 1);
    expect(done).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toBe(false);
    expect(guard.pendingCount()).toBe(1);
  });

  it("one deadline covers work tracked while waiting", async () => {
    const { guard } = setup();
    let resolveFirst!: () => void;
    guard.track(new Promise<void>((r) => (resolveFirst = r)));
    let done: boolean | undefined;
    void guard.settle().then((v) => (done = v));
    await vi.advanceTimersByTimeAsync(1500);
    guard.track(new Promise<void>(() => {})); // started during the wait
    resolveFirst();
    await vi.advanceTimersByTimeAsync(499);
    expect(done).toBeUndefined();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toBe(false); // 2 s in total, not 1.5 s + 2 s
  });

  it("drains work tracked while waiting, not only what was pending at the start", async () => {
    const { guard } = setup();
    let resolveA!: () => void;
    let resolveB!: () => void;
    guard.track(new Promise<void>((r) => (resolveA = r)));
    let done: boolean | undefined;
    void guard.settle().then((v) => (done = v));
    await vi.advanceTimersByTimeAsync(300);
    guard.track(new Promise<void>((r) => (resolveB = r)));
    resolveA();
    await vi.advanceTimersByTimeAsync(300);
    expect(done).toBeUndefined(); // B is still going
    resolveB();
    await vi.advanceTimersByTimeAsync(0);
    expect(done).toBe(true);
  });

  it("track hands back the same promise and does not leak rejections", async () => {
    const { guard } = setup();
    const p = Promise.reject(new Error("x"));
    expect(guard.track(p)).toBe(p);
    await expect(p).rejects.toThrow("x");
    await vi.advanceTimersByTimeAsync(0);
    expect(guard.pendingCount()).toBe(0);
  });

  it("a later registration replaces an earlier one; the earlier unregister is then a no-op", () => {
    const { guard, unregister } = setup();
    const second = guard.register({ kind: "review", hasUnsavedWork: () => true });
    expect(guard.unsavedKind()).toBe("review");
    unregister();
    expect(guard.unsavedKind()).toBe("review");
    second();
    expect(guard.unsavedKind()).toBeNull();
  });

  describe("depart (Return to Home Room, the quiz's X)", () => {
    it("with nothing unsaved or pending, leaves at once", async () => {
      const { navigate, guard } = setup();
      await expect(guard.depart(HOME)).resolves.toBeNull();
      expect(navigate).toHaveBeenCalledWith(HOME);
    });

    it("with unsaved answers, stays and names them for the dialog", async () => {
      const { win, navigate, guard, set } = setup();
      set(true);
      await expect(guard.depart(HOME)).resolves.toBe("lesson");
      expect(navigate).not.toHaveBeenCalled();
      expect(win.count("beforeunload")).toBe(1); // still guarded
    });

    it("waits for a save under way, then leaves once it is confirmed", async () => {
      const { navigate, guard, set } = setup();
      set(true); // the quiz is submitting: not yet confirmed
      let confirm!: () => void;
      guard.track(
        new Promise<void>((r) => (confirm = r)).then(() => set(false)) // the server confirmed
      );
      let result: string | null | undefined;
      void guard.depart(HOME).then((v) => (result = v));
      await vi.advanceTimersByTimeAsync(800);
      expect(navigate).not.toHaveBeenCalled();
      confirm();
      await vi.advanceTimersByTimeAsync(0);
      expect(result).toBeNull();
      expect(navigate).toHaveBeenCalledWith(HOME);
    });

    it("a save that fails leaves the answers unsaved: the dialog, not a departure", async () => {
      const { navigate, guard, set } = setup();
      set(true);
      let fail!: () => void;
      guard.track(new Promise<void>((r) => (fail = r)));
      let result: string | null | undefined;
      void guard.depart("/learn").then((v) => (result = v));
      fail();
      await vi.advanceTimersByTimeAsync(0);
      expect(result).toBe("lesson");
      expect(navigate).not.toHaveBeenCalled();
    });

    it("a resend still going at 2 s does not hold the learner (its record stays stored)", async () => {
      const { navigate, guard } = setup(); // PendingRecovery: nothing unsaved in the page
      guard.track(new Promise<void>(() => {}));
      void guard.depart(HOME);
      await vi.advanceTimersByTimeAsync(LEAVE_DEADLINE_MS - 1);
      expect(navigate).not.toHaveBeenCalled();
      await vi.advanceTimersByTimeAsync(1);
      expect(navigate).toHaveBeenCalledWith(HOME);
    });

    it("leave, restore from the back/forward cache, and the guard works again", async () => {
      const { win, navigate, guard, set } = setup();
      set(true);
      guard.leave(HOME); // "Leave without saving"
      expect(win.beforeUnload()).toBe(false);
      win.pageshow(true);
      expect(win.beforeUnload()).toBe(true);
      await expect(guard.depart(HOME)).resolves.toBe("lesson");
      expect(navigate).toHaveBeenCalledTimes(1);
    });
  });

  it("works without a window (server render)", () => {
    const guard = createLeaveGuard({ target: null, navigate: vi.fn() });
    guard.register({ kind: "lesson", hasUnsavedWork: () => true });
    expect(() => guard.refresh()).not.toThrow();
    expect(guard.isArmed()).toBe(false);
  });
});
