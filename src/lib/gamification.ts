export const XP_PER_LESSON = 20;
export const XP_PER_REVIEW_WORD = 2;

export function todayStr(now = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function dateDiffDays(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / (24 * 60 * 60 * 1000));
}

// Streak on activity completion: same day keeps it, consecutive day increments, gap resets to 1.
export function nextStreak(lastActiveDate: string | null, streakCount: number, now = new Date()): number {
  const today = todayStr(now);
  if (!lastActiveDate) return 1;
  const gap = dateDiffDays(lastActiveDate, today);
  if (gap === 0) return Math.max(1, streakCount);
  if (gap === 1) return streakCount + 1;
  return 1;
}

// Streak when merely reading state: a gap of more than one day means it's broken.
export function effectiveStreak(lastActiveDate: string | null, streakCount: number, now = new Date()): number {
  if (!lastActiveDate) return 0;
  return dateDiffDays(lastActiveDate, todayStr(now)) > 1 ? 0 : streakCount;
}
