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

/** A departure whose document is still here this long after `location.assign` was
 *  stopped (the browser's Stop, a failed load): the page goes back to normal. */
export const STALLED_DEPARTURE_MS = 3000;

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
  /**
   * Disarms, then navigates (a full document navigation). The departure lasts until the
   * document goes; if it is still here `STALLED_DEPARTURE_MS` later, the guard, the prompt
   * and every "leaving" state go back to normal (a late timer from an older departure is
   * ignored).
   */
  leave(url: string): void;
  /**
   * The in-app leave buttons (Return to Home Room, the quiz's X): starts a departure at
   * once (so course changes and duplicate presses see it), waits for tracked saves under
   * one deadline, then re-reads the predicate. Nothing unsaved: leaves for `url` and
   * resolves null. Otherwise ends the departure and resolves what is unsaved, for the
   * dialog. A press while a departure is under way is ignored (resolves null).
   */
  depart(url: string, deadlineMs?: number): Promise<UnsavedKind | null>;
  /** True from a leave button's press until the page is gone, stalls or asks. */
  isDeparting(): boolean;
  /** Notified whenever `isDeparting` changes; returns the unsubscribe. */
  subscribe(listener: () => void): () => void;
}

export function createLeaveGuard(o: {
  target: EventTargetLike | null;
  navigate: (url: string) => void;
}): LeaveGuard {
  let source: UnsavedSource | null = null;
  let armed = false;
  let allowed = false;
  const pending = new Set<Promise<unknown>>();
  // The departure under way, if any; each one has its own number so a late timer from an
  // earlier one changes nothing.
  let departing = false;
  let attempt = 0;
  const listeners = new Set<() => void>();

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

  function setDeparting(v: boolean) {
    if (departing === v) return;
    departing = v;
    for (const l of [...listeners]) l();
  }

  function beginDeparture(): number {
    attempt += 1;
    setDeparting(true);
    return attempt;
  }

  /** Ends departure `a` if it is still the current one: the page is staying. */
  function endDeparture(a: number) {
    if (a !== attempt) return;
    attempt += 1;
    allowed = false;
    setDeparting(false);
    refresh();
  }

  // A page restored from the back/forward cache is live again: whatever let it go before
  // no longer applies.
  o.target?.addEventListener("pageshow", (e) => {
    if (!(e as PageTransitionEvent).persisted) return;
    if (departing) endDeparture(attempt);
    else resume();
  });

  function leave(url: string) {
    const a = departing ? attempt : beginDeparture();
    allowUnload();
    o.navigate(url);
    setTimeout(() => endDeparture(a), STALLED_DEPARTURE_MS);
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
      if (departing) return null;
      const a = beginDeparture();
      await settle(deadlineMs);
      if (a !== attempt) return null; // reset meanwhile (a back/forward cache restore)
      const kind = unsavedKind();
      if (kind) {
        endDeparture(a);
        return kind;
      }
      leave(url);
      return null;
    },
    isDeparting: () => departing,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/** This document's guard. */
export const leaveGuard: LeaveGuard = createLeaveGuard({
  target: typeof window === "undefined" ? null : window,
  navigate: (url) => window.location.assign(url),
});
