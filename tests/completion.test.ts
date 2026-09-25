import { describe, expect, it } from "vitest";
import { awardOutcome, launcherSummary, shouldAwardReview, SKIPPED, withUnlock } from "@/lib/completion";
import type { KitAwardResult } from "@/lib/kit";

const r = (over: Partial<KitAwardResult> = {}): KitAwardResult => ({
  awarded_xp: 10,
  xp: 110,
  gems: 20,
  level: 2,
  streak: 3,
  level_up: false,
  new_achievements: [],
  ...over,
});

describe("award status (work order criteria 16 and 21)", () => {
  it("is awarded when XP was granted, capped at zero, failed when the portal did not answer", () => {
    expect(awardOutcome(r())).toEqual({ status: "awarded", result: r() });
    expect(awardOutcome(r({ awarded_xp: 0 }))).toEqual({ status: "capped", result: r({ awarded_xp: 0 }) });
    expect(awardOutcome(null)).toEqual({ status: "failed", result: null });
    expect(SKIPPED).toEqual({ status: "skipped", result: null });
  });
});

describe("first-lesson unlock totals (criterion 14, WW-P5-008)", () => {
  it("takes the unlock's totals (they include the gems) but keeps the award's XP and level-up", () => {
    const award = r({ awarded_xp: 10, gems: 20, level_up: true });
    const unlock = r({ awarded_xp: 0, gems: 25, level_up: false, new_achievements: ["wordwave-first-lesson"] });
    expect(withUnlock(award, unlock)).toEqual({
      ...unlock,
      awarded_xp: 10,
      level_up: true,
      new_achievements: ["wordwave-first-lesson"],
    });
  });

  it("leaves the award untouched when the unlock failed", () => {
    expect(withUnlock(r(), null)).toEqual(r());
  });
});

describe("review award", () => {
  it("is one award per session with at least one applied result", () => {
    expect(shouldAwardReview(0)).toBe(false);
    expect(shouldAwardReview(1)).toBe(true);
    expect(shouldAwardReview(12)).toBe(true);
  });
});

describe("launcher summary (criterion 17)", () => {
  it("names the active course and the share of its lessons done", () => {
    expect(launcherSummary({ courseName: "Spanish", completedInCourse: 0, lessonsInCourse: 800 })).toEqual({
      headline: "0 lessons done in Spanish",
      percent: 0,
    });
    expect(launcherSummary({ courseName: "Latin", completedInCourse: 1, lessonsInCourse: 196 })).toEqual({
      headline: "1 lesson done in Latin",
      percent: 1,
    });
    expect(launcherSummary({ courseName: "Spanish", completedInCourse: 400, lessonsInCourse: 800 })).toEqual({
      headline: "400 lessons done in Spanish",
      percent: 50,
    });
  });

  it("stays within 0-100 for an empty or over-counted course", () => {
    expect(launcherSummary({ courseName: "X", completedInCourse: 3, lessonsInCourse: 0 }).percent).toBe(0);
    expect(launcherSummary({ courseName: "X", completedInCourse: 5, lessonsInCourse: 4 }).percent).toBe(100);
  });
});
