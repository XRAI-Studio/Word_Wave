/**
 * A different learner is now signed in on this browser (another tab signed in to the
 * portal as someone else). The open page still carries the old identity in its kit, HUD
 * and quiz, so it is reloaded under the new one; the old learner's unsaved answers are
 * dropped, never relabelled (Codex WW-P5-R3-002). The flag lets the reloaded page say why.
 */
export const ACCOUNT_CHANGED_KEY = "wordwave:account-changed";

export function reloadForAccountChange(): void {
  try {
    window.sessionStorage.setItem(ACCOUNT_CHANGED_KEY, "1");
  } catch {}
  window.location.reload();
}

/** True once after such a reload (the flag is cleared when read). */
export function takeAccountChangedNotice(): boolean {
  try {
    const set = window.sessionStorage.getItem(ACCOUNT_CHANGED_KEY) !== null;
    window.sessionStorage.removeItem(ACCOUNT_CHANGED_KEY);
    return set;
  } catch {
    return false;
  }
}
