/**
 * Departure coordinator (home-room plan, "Latin & Spanish"): one instance per document.
 *
 * A quiz session is its own document (every way in and out of it is a full navigation),
 * so every way of leaving it is a document departure that `beforeunload` covers. The quiz
 * registers a predicate ("at least one answer given and not yet saved"); while it holds,
 * a `beforeunload` listener is armed and the browser shows its own leave prompt. Saves
 * that are under way (the quiz's completion, PendingRecovery's resend) are tracked, so a
 * clean "Return to Home Room" can wait for them under one deadline before leaving.
 *
 * iOS/iPadOS Safari never shows `beforeunload` prompts; there the in-page dialog (Return
 * to Home Room, the quiz's X) is the only message (plan A4, platform scope).
 */

/** The portal's front door (`PORTAL` in api-fetch, plus the slash): every class's "Return
 *  to Home Room" lands here. A literal, because api-fetch imports this module. */
export const HOME = "https://class.travelschooling.com/";

/** How long a clean departure waits for tracked saves (plan A3: at most 2 s). */
export const LEAVE_DEADLINE_MS = 2000;

export type UnsavedKind = "lesson" | "review";

export interface UnsavedSource {
  kind: UnsavedKind;
  hasUnsavedWork(): boolean;
}

interface EventTargetLike {
  addEventListener(type: string, fn: (e: Event) => void): void;
  removeEventListener(type: string, fn: (e: Event) => void): void;
}

export interface LeaveGuard {
  /** Registers the page's predicate (the latest registration wins); returns the unregister. */
  register(source: UnsavedSource): () => void;
  hasUnsavedWork(): boolean;
  /** What is unsaved, for the dialog's wording; null when nothing is. */
  unsavedKind(): UnsavedKind | null;
  /** Re-reads the predicate and arms or disarms `beforeunload` to match. */
  refresh(): void;
  isArmed(): boolean;
  /** Tracks a save in flight; returns the same promise. */
  track<T>(p: Promise<T>): Promise<T>;
  pendingCount(): number;
  /** Waits for every tracked save (including ones started meanwhile) under one deadline;
   *  true when all settled in time. */
  settle(deadlineMs?: number): Promise<boolean>;
  /** Lets the document go without a prompt: the work is kept elsewhere, or the learner
   *  chose to drop it. Stays in force until `resume`. */
  allowUnload(): void;
  /** Undoes `allowUnload` (a departure that did not happen) and re-reads the predicate. */
  resume(): void;
  /** Disarms, then navigates (a full document navigation). */
  leave(url: string): void;
  /**
   * The in-app leave buttons (Return to Home Room, the quiz's X): waits for tracked saves
   * under one deadline, then re-reads the predicate. Nothing unsaved: leaves for `url` and
   * resolves null. Otherwise stays and resolves what is unsaved, for the dialog.
   */
  depart(url: string, deadlineMs?: number): Promise<UnsavedKind | null>;
}

export function createLeaveGuard(o: {
  target: EventTargetLike | null;
  navigate: (url: string) => void;
}): LeaveGuard {
  let source: UnsavedSource | null = null;
  let armed = false;
  let allowed = false;
  const pending = new Set<Promise<unknown>>();

  const onBeforeUnload = (e: Event) => {
    e.preventDefault();
    (e as BeforeUnloadEvent).returnValue = "";
  };

  const hasUnsavedWork = () => source?.hasUnsavedWork() ?? false;

  function refresh() {
    const want = !allowed && hasUnsavedWork() && o.target !== null;
    if (want === armed) return;
    armed = want;
    if (want) o.target!.addEventListener("beforeunload", onBeforeUnload);
    else o.target?.removeEventListener("beforeunload", onBeforeUnload);
  }

  function allowUnload() {
    allowed = true;
    refresh();
  }

  function resume() {
    allowed = false;
    refresh();
  }

  // A page restored from the back/forward cache is live again: whatever let it go before
  // no longer applies.
  o.target?.addEventListener("pageshow", (e) => {
    if ((e as PageTransitionEvent).persisted) resume();
  });

  function leave(url: string) {
    allowUnload();
    o.navigate(url);
  }

  async function settle(deadlineMs = LEAVE_DEADLINE_MS) {
    const deadline = Date.now() + deadlineMs;
    while (pending.size > 0) {
      const left = deadline - Date.now();
      if (left <= 0) return false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const timedOut = await Promise.race([
        Promise.allSettled([...pending]).then(() => false),
        new Promise<boolean>((r) => {
          timer = setTimeout(() => r(true), left);
        }),
      ]);
      clearTimeout(timer);
      if (timedOut) return false;
    }
    return true;
  }

  const unsavedKind = () => (hasUnsavedWork() ? (source?.kind ?? null) : null);

  return {
    register(s) {
      source = s;
      refresh();
      return () => {
        if (source !== s) return;
        source = null;
        refresh();
      };
    },
    hasUnsavedWork,
    unsavedKind,
    refresh,
    isArmed: () => armed,
    track(p) {
      pending.add(p);
      const done = () => {
        pending.delete(p);
      };
      p.then(done, done);
      return p;
    },
    pendingCount: () => pending.size,
    settle,
    allowUnload,
    resume,
    leave,
    async depart(url, deadlineMs) {
      await settle(deadlineMs);
      const kind = unsavedKind();
      if (kind) return kind;
      leave(url);
      return null;
    },
  };
}

/** This document's guard. */
export const leaveGuard: LeaveGuard = createLeaveGuard({
  target: typeof window === "undefined" ? null : window,
  navigate: (url) => window.location.assign(url),
});
