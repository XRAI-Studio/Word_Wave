import { describe, expect, it, vi } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

import { awardMessage, ResultScreen } from "@/components/quiz/result-screen";
import type { AwardOutcome } from "@/lib/completion";

const totals = {
  awarded_xp: 10,
  xp: 10,
  gems: 5,
  level: 1,
  streak: 1,
  level_up: false,
  new_achievements: [] as string[],
};
const render = (award: AwardOutcome, mode: "lesson" | "review" = "lesson") =>
  renderToStaticMarkup(createElement(ResultScreen, { award, mode, accuracy: 0.9 }));

describe("result screen (work order criterion 21, WW-P5-005)", () => {
  it("shows +XP when awarded", () => {
    const html = render({ status: "awarded", result: totals });
    expect(html).toContain('data-status="awarded"');
    expect(html).toContain("+10 XP");
  });

  it("shows the daily limit when capped", () => {
    expect(render({ status: "capped", result: { ...totals, awarded_xp: 0 } })).toContain("Daily XP limit reached");
  });

  it("says a replayed lesson earns nothing new, without claiming a failure", () => {
    const html = render({ status: "skipped", result: null });
    expect(html).toContain("Already completed: no new XP");
    expect(html).not.toContain("could not be recorded");
  });

  it("shows nothing extra for a review with nothing to award", () => {
    expect(awardMessage({ status: "skipped", result: null }, "review")).toBeNull();
    expect(render({ status: "skipped", result: null }, "review")).not.toContain('data-testid="award-message"');
  });

  it("says progress was saved when the ledger call failed", () => {
    expect(render({ status: "failed", result: null })).toContain("Progress saved; XP could not be recorded");
  });

  it("lists a new achievement", () => {
    const html = render({ status: "awarded", result: { ...totals, new_achievements: ["wordwave-first-lesson"] } });
    expect(html).toContain("Achievement unlocked");
  });
});
