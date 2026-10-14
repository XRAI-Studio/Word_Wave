// @vitest-environment jsdom
// Every graded attempt in a quiz goes to the portal's answer log through `kit.answer`.
import { act, createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Quiz } from "@/components/quiz/quiz";
import type { AnswerDetail, Kit } from "@/lib/kit";
import type { ChallengeDTO } from "@/lib/types";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

let kit: Kit;
vi.mock("@/components/kit-provider", () => ({ useKit: () => kit }));

type Logged = { correct: boolean } & AnswerDetail;
let answers: Logged[];

function baseKit(): Kit {
  return {
    user: { id: "u", displayName: "U", role: "student" },
    totals: { xp: 0, gems: 0, level: 1, streak: 0 },
    launcherUrl: "https://class.travelschooling.com",
    load: async () => ({}),
    save: async () => undefined,
    award: vi.fn(async () => ({ awarded_xp: 0, xp: 0, gems: 0, level: 1, streak: 0, level_up: false, new_achievements: [] })),
    unlock: async () => ({}),
    toast: () => undefined,
  };
}

const MC: ChallengeDTO = {
  id: "c-mc",
  order: 1,
  prompt: 'What does "la niña" mean?',
  correctAnswer: "the girl",
  type: "MULTIPLE_CHOICE",
  meta: { choices: ["the girl", "the boy"], wordIds: ["w1"] },
};
const FB: ChallengeDTO = {
  id: "c-fb",
  order: 2,
  prompt: 'Type the Spanish for "the son"',
  correctAnswer: "el hijo",
  type: "FILL_BLANK",
  meta: { wordIds: ["w3"] },
};
const TR: ChallengeDTO = {
  id: "c-tr",
  order: 3,
  prompt: 'Translate: "the girl eats"',
  correctAnswer: "la niña come",
  type: "TRANSLATE",
  meta: { wordBank: ["come", "la", "niña", "bebe"], wordIds: ["w1"] },
};
const MATCH: ChallengeDTO = {
  id: "c-match",
  order: 4,
  prompt: "Match the pairs",
  correctAnswer: "",
  type: "MATCH",
  meta: {
    pairs: [
      { term: "la niña", translation: "the girl", wordId: "w1" },
      { term: "el niño", translation: "the boy", wordId: "w2" },
    ],
    wordIds: ["w1", "w2"],
  },
};

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  answers = [];
  kit = { ...baseKit(), answer: (correct, detail) => void answers.push({ correct, ...detail }) };
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
});

async function render(challenges: ChallengeDTO[]) {
  await act(async () =>
    root.render(createElement(Quiz, { challenges, mode: "lesson", lessonId: "l1", courseCode: "es", skill: "Spanish: People" }))
  );
}

function button(text: string | RegExp): HTMLButtonElement {
  const found = [...container.querySelectorAll("button")].find((b) =>
    typeof text === "string" ? b.textContent?.trim() === text : text.test(b.textContent ?? "")
  );
  if (!found) throw new Error(`no button ${text}`);
  return found;
}

async function click(el: HTMLElement) {
  await act(async () => el.dispatchEvent(new MouseEvent("click", { bubbles: true })));
}

async function type(value: string) {
  const input = container.querySelector("input")!;
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
  await act(async () => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
}

describe("quiz answer log (kit.answer)", () => {
  it("reports a right multiple-choice answer as correct, with item and skill", async () => {
    await render([MC, FB]);
    await click(button(/the girl$/));
    expect(answers).toEqual([]); // choosing is not graded
    await click(button("Check"));
    expect(answers).toEqual([
      { correct: true, item: 'What does "la niña" mean?', skill: "Spanish: People", given: "the girl", expected: "the girl" },
    ]);
    await click(button("Continue"));
    expect(answers).toHaveLength(1); // moving on is not graded
    expect(kit.award).not.toHaveBeenCalled(); // XP stays on the server
  });

  it("reports a wrong answer as not correct, and the re-queued retry again", async () => {
    await render([MC, FB]);
    await click(button(/the boy$/));
    await click(button("Check"));
    expect(answers).toEqual([
      { correct: false, item: 'What does "la niña" mean?', skill: "Spanish: People", given: "the boy", expected: "the girl" },
    ]);
    await click(button("Continue"));
    await type("el ijo");
    await click(button("Check"));
    await click(button("Continue"));
    // The missed card came back: answering it again is another graded attempt.
    await click(button(/the girl$/));
    await click(button("Check"));
    expect(answers.map((a) => [a.item, a.correct, a.given])).toEqual([
      ['What does "la niña" mean?', false, "the boy"],
      ['Type the Spanish for "the son"', false, "el ijo"],
      ['What does "la niña" mean?', true, "the girl"],
    ]);
  });

  it("reports typed and word-bank answers with what was given", async () => {
    await render([FB, TR, MC]);
    await type("El Hijo");
    await click(button("Check"));
    await click(button("Continue"));
    for (const tok of ["la", "niña", "come"]) await click(button(tok));
    await click(button("Check"));
    expect(answers).toEqual([
      { correct: true, item: 'Type the Spanish for "the son"', skill: "Spanish: People", given: "El Hijo", expected: "el hijo" },
      { correct: true, item: 'Translate: "the girl eats"', skill: "Spanish: People", given: "la niña come", expected: "la niña come" },
    ]);
  });

  it("reports each match pairing, and not the finished match again", async () => {
    vi.useFakeTimers();
    try {
      await render([MATCH, MC]);
      await click(button("la niña"));
      expect(answers).toEqual([]); // one tile alone is not an attempt
      await click(button("the boy"));
      await click(button("la niña"));
      await click(button("the girl"));
      await click(button("el niño"));
      await click(button("the boy"));
      await act(async () => vi.advanceTimersByTime(1000)); // the match completes
      expect(answers).toEqual([
        { correct: false, item: "la niña → the girl", skill: "Spanish: People", given: "the boy", expected: "the girl" },
        { correct: true, item: "la niña → the girl", skill: "Spanish: People", given: "the girl", expected: "the girl" },
        { correct: true, item: "el niño → the boy", skill: "Spanish: People", given: "the boy", expected: "the boy" },
      ]);
      expect(button("Continue")).toBeTruthy();
    } finally {
      vi.useRealTimers();
    }
  });

  it("grades as before with an older kit that has no answer", async () => {
    kit = baseKit();
    await render([MC, FB]);
    await click(button(/the boy$/));
    await click(button("Check"));
    expect(container.textContent).toContain("Correct answer:");
    await click(button("Continue"));
    expect(container.textContent).toContain('Type the Spanish for "the son"');
  });

  it("grades as before when answer throws", async () => {
    kit = {
      ...baseKit(),
      answer: () => {
        throw new Error("boom");
      },
    };
    await render([MC, FB]);
    await click(button(/the girl$/));
    await click(button("Check"));
    expect(button("Continue")).toBeTruthy();
  });
});
