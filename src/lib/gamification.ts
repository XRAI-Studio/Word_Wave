export const XP_PER_LESSON = 20;
export const XP_PER_REVIEW_WORD = 2;
export const XP_PERFECT_BONUS = 5;

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 2 * 60 * 60 * 1000; // 1 heart per 2 hours

export const GEMS_PER_LESSON = 5;
export const GEMS_PERFECT_BONUS = 3;
export const GEMS_PER_REVIEW = 2;
export const GEMS_PER_QUEST = 20;
export const GEMS_STREAK_MILESTONE = 25;
export const STREAK_MILESTONE_DAYS = 7;

export const STREAK_FREEZE_COST = 100;
export const MAX_STREAK_FREEZES = 2;

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

export function yesterdayStr(now = new Date()): string {
  return todayStr(new Date(now.getTime() - 24 * 60 * 60 * 1000));
}

// Freeze-aware streak reconciliation for the read path. Missed days are
// covered by consuming one streak freeze each; a covered streak has its
// lastActiveDate bumped to yesterday so the freezes aren't spent twice.
// If the freezes can't cover every missed day, the streak breaks and the
// freezes are kept.
export function reconcileStreak(
  lastActiveDate: string | null,
  streakCount: number,
  streakFreezes: number,
  now = new Date()
): { streakCount: number; streakFreezes: number; lastActiveDate: string | null } {
  if (!lastActiveDate) return { streakCount: 0, streakFreezes, lastActiveDate };
  const gap = dateDiffDays(lastActiveDate, todayStr(now));
  if (gap <= 1) return { streakCount, streakFreezes, lastActiveDate };
  const missed = gap - 1;
  if (streakCount > 0 && streakFreezes >= missed) {
    return {
      streakCount,
      streakFreezes: streakFreezes - missed,
      lastActiveDate: yesterdayStr(now),
    };
  }
  return { streakCount: 0, streakFreezes, lastActiveDate };
}

// Lazy heart regeneration: 1 heart per HEART_REGEN_MS since heartsUpdatedAt,
// capped at MAX_HEARTS. The anchor advances only by whole hearts gained so
// partial progress toward the next heart is never lost; at full hearts it
// tracks `now` so the timer starts fresh on the next loss.
export function regenHearts(
  hearts: number,
  heartsUpdatedAt: Date,
  now = new Date()
): { hearts: number; heartsUpdatedAt: Date } {
  if (hearts >= MAX_HEARTS) return { hearts: MAX_HEARTS, heartsUpdatedAt: now };
  const gained = Math.floor((now.getTime() - heartsUpdatedAt.getTime()) / HEART_REGEN_MS);
  if (gained <= 0) return { hearts, heartsUpdatedAt };
  const next = Math.min(MAX_HEARTS, hearts + gained);
  return {
    hearts: next,
    heartsUpdatedAt:
      next >= MAX_HEARTS ? now : new Date(heartsUpdatedAt.getTime() + gained * HEART_REGEN_MS),
  };
}
