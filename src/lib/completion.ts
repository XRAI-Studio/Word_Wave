import type { KitAwardResult } from "@/lib/kit";
import type { LauncherSummary } from "@/lib/portal";

/**
 * Pure decisions behind the two completion routes (work order criteria 14–17), kept free
 * of Next, Prisma and the network so they are unit-tested directly.
 */

export type AwardStatus = "awarded" | "capped" | "skipped" | "failed";

export interface AwardOutcome {
  status: AwardStatus;
  /** The learner's totals after the award (and unlock), when the portal answered. */
  result: KitAwardResult | null;
}

export const SKIPPED: AwardOutcome = { status: "skipped", result: null };

/** Classifies what the portal returned for an award that was actually requested. */
export function awardOutcome(result: KitAwardResult | null): AwardOutcome {
  if (!result) return { status: "failed", result: null };
  return { status: result.awarded_xp > 0 ? "awarded" : "capped", result };
}

/**
 * After the first-lesson unlock, its totals include the achievement's gems, so they
 * replace the award's totals; the award's own `awarded_xp` and `level_up` are kept, and
 * the new achievements are merged. A failed unlock leaves the award untouched.
 */
export function withUnlock(award: KitAwardResult, unlock: KitAwardResult | null): KitAwardResult {
  if (!unlock) return award;
  return {
    ...unlock,
    awarded_xp: award.awarded_xp,
    level_up: award.level_up,
    new_achievements: [...award.new_achievements, ...unlock.new_achievements],
  };
}

/** A review earns one `review_session` award per request, and only when something was reviewed. */
export function shouldAwardReview(appliedResults: number): boolean {
  return appliedResults > 0;
}

export interface SummarySnapshot {
  courseName: string;
  completedInCourse: number;
  lessonsInCourse: number;
}

/** The launcher tile's text: lessons done in the active course and the share of it. */
export function launcherSummary(s: SummarySnapshot): LauncherSummary {
  const n = s.completedInCourse;
  const percent = s.lessonsInCourse > 0 ? Math.min(100, Math.round((100 * n) / s.lessonsInCourse)) : 0;
  return { headline: `${n} ${n === 1 ? "lesson" : "lessons"} done in ${s.courseName}`, percent };
}
