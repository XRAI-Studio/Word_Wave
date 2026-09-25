/**
 * A completion that could not be saved because the session expired mid-quiz (work order
 * criterion 21). It is kept in sessionStorage across the portal sign-in and stays there
 * until it is sent successfully or discarded; it is sent only for the learner and course
 * the server reports now, so a different account signing in on this tab never inherits
 * another learner's answers.
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

/** The stored submission for this route, left in place (it stays until sent or discarded). */
export function peekPending(storage: StorageLike, path: string): PendingSubmission | null {
  const p = read(storage);
  return p && p.path === path ? p : null;
}

/** Whether a submission is waiting for this route. */
export function hasPendingFor(storage: StorageLike, path: string): boolean {
  return peekPending(storage, path) !== null;
}

/** Removes the stored submission if it is this route's (after a send, or on a discard). */
export function clearPending(storage: StorageLike, path: string): void {
  if (peekPending(storage, path)) storage.removeItem(PENDING_KEY);
}

/**
 * Whether a kept submission may be sent for the learner and active course the server
 * reports now. Anything else (another account signed in on this tab, or the course
 * changed) means it is discarded unsent.
 */
export function belongsTo(p: PendingSubmission, now: { userId: string; courseCode: string | null }): boolean {
  return p.userId === now.userId && p.courseCode === now.courseCode;
}
