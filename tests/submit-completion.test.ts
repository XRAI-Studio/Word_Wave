import { describe, expect, it } from "vitest";
import { hudTotalsAfter } from "@/lib/submit-completion";

const result = { awarded_xp: 10, xp: 40, gems: 5, level: 1, streak: 2, level_up: false, new_achievements: [] };

describe("hudTotalsAfter (WW-P5-R4-002, WW-P5-R5-001)", () => {
  it("a first send moves the HUD to its award's totals", () => {
    expect(hudTotalsAfter({ award: { status: "awarded", result } })).toBe(result);
  });

  it("a first send without a portal answer leaves the HUD alone", () => {
    expect(hudTotalsAfter({ award: { status: "failed", result: null } })).toBeNull();
  });

  it("a repeat uses the current totals read with it, never its historical award", () => {
    const now = { xp: 90, gems: 5, level: 2, streak: 3 };
    expect(hudTotalsAfter({ duplicate: true, award: { status: "awarded", result }, totals: now })).toBe(now);
  });

  it("a repeat whose totals read failed leaves the HUD alone", () => {
    expect(hudTotalsAfter({ duplicate: true, award: { status: "awarded", result }, totals: null })).toBeNull();
    expect(hudTotalsAfter({ duplicate: true, award: { status: "awarded", result } })).toBeNull();
  });
});
