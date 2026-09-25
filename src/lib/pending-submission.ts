/**
 * A completion that could not be saved because the session expired mid-quiz (work order
 * criterion 21). It is kept in sessionStorage across the portal sign-in and submitted
 * once when the same quiz route loads again, but only for the same learner and course:
 * a different account signing in on this tab never inherits another learner's answers.
 */

export interface PendingSubmission {
  /** The quiz page's pathname, e.g. `/lesson/abc` or `/review/session`. */
  path: string;
  /** The API route and JSON body to POST. */
  url: string;
  body: unknown;
  userId: string;
  courseCode: string;
  accuracy: number;
}

export const PENDING_KEY = "wordwave:pending-submission";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function savePending(storage: StorageLike, p: PendingSubmission): void {
  try {
    storage.setItem(PENDING_KEY, JSON.stringify(p));
  } catch {
    // Storage full or disabled: the learner replays the quiz; nothing else breaks.
  }
}

function read(storage: StorageLike): PendingSubmission | null {
  try {
    const raw = storage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as PendingSubmission) : null;
  } catch {
    return null;
  }
}

/** Whether a submission is waiting for this route (no removal; decides if a check is needed). */
export function hasPendingFor(storage: StorageLike, path: string): boolean {
  return read(storage)?.path === path;
}

/**
 * Returns the stored submission for this route when it belongs to this learner and
 * course, removing it either way it is decided: taken to submit, or discarded because
 * the learner or course differs. One for another route is left alone.
 */
export function takePending(
  storage: StorageLike,
  here: { path: string; userId: string; courseCode: string }
): PendingSubmission | null {
  const p = read(storage);
  if (!p || p.path !== here.path) return null;
  storage.removeItem(PENDING_KEY);
  if (p.userId !== here.userId || p.courseCode !== here.courseCode) return null;
  return p;
}
