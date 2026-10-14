import { describe, expect, it } from "vitest";
import { createMockKit, MemoryStorage, MemoryTransport, reportAnswer, type Kit } from "@/lib/kit";

const bareKit = (): Kit => ({
  user: { id: "u", displayName: "U", role: "student" },
  totals: { xp: 0, gems: 0, level: 1, streak: 0 },
  launcherUrl: "https://class.travelschooling.com",
  load: async () => ({}),
  save: async () => undefined,
  award: async () => ({ awarded_xp: 0, xp: 0, gems: 0, level: 1, streak: 0, level_up: false, new_achievements: [] }),
  unlock: async () => ({}),
  toast: () => undefined,
});

describe("kit.answer (portal migration 0018)", () => {
  it("the mock kit records each attempt on its transport, right and wrong", async () => {
    const transport = new MemoryTransport();
    const kit = await createMockKit({ game: "wordwave", userId: "u", storage: new MemoryStorage(), transport });
    expect(kit.answer?.(true, { item: "puella → girl", skill: "Latin: Fēminae" })).toBeUndefined();
    reportAnswer(kit, false, { item: "puella → girl", given: "boy", expected: "girl" });
    reportAnswer(kit, true);
    expect(transport.answers).toEqual([
      { correct: true, item: "puella → girl", skill: "Latin: Fēminae" },
      { correct: false, item: "puella → girl", given: "boy", expected: "girl" },
      { correct: true },
    ]);
    // Nothing goes through the award RPC for an answer.
    expect(transport.rpcCalls.filter((c) => c.name === "award")).toEqual([]);
  });

  it("reportAnswer does nothing for an older kit without answer, or no kit", () => {
    expect(() => reportAnswer(bareKit(), true, { item: "x" })).not.toThrow();
    expect(() => reportAnswer(null, false)).not.toThrow();
    expect(() => reportAnswer(undefined, false)).not.toThrow();
  });

  it("reportAnswer swallows a throwing answer", () => {
    const kit: Kit = {
      ...bareKit(),
      answer: () => {
        throw new Error("boom");
      },
    };
    expect(() => reportAnswer(kit, true)).not.toThrow();
  });
});
