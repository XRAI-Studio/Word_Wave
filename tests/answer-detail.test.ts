import { describe, expect, it } from "vitest";
import {
  ANSWER_TEXT_MAX,
  challengeAnswerDetail,
  clipAnswerText,
  lessonSkill,
  matchAnswerDetail,
  reviewSkill,
} from "@/lib/answer-detail";
import type { ChallengeDTO, MatchMeta } from "@/lib/types";

const mc: ChallengeDTO = {
  id: "c1",
  order: 1,
  prompt: 'What does "la niña" mean?',
  correctAnswer: "the girl",
  type: "MULTIPLE_CHOICE",
  meta: { choices: ["the girl", "the boy"], wordIds: ["w1"] },
};
const pairs: MatchMeta = {
  pairs: [
    { term: "puella", translation: "girl", wordId: "w1" },
    { term: "puer", translation: "boy", wordId: "w2" },
  ],
  wordIds: ["w1", "w2"],
};

describe("answer detail for the portal's answer log", () => {
  it("names a lesson's skill by course and unit, and a review's by course", () => {
    expect(lessonSkill("Spanish", "Greetings")).toBe("Spanish: Greetings");
    expect(lessonSkill("Latin", "Fēminae")).toBe("Latin: Fēminae");
    expect(lessonSkill(undefined, "Greetings")).toBe("Greetings");
    expect(lessonSkill(undefined, undefined)).toBeUndefined();
    expect(reviewSkill("Spanish")).toBe("Spanish: review");
    expect(reviewSkill(undefined)).toBe("review");
  });

  it("uses the prompt as the item and keeps what was answered and expected", () => {
    expect(challengeAnswerDetail(mc, "the boy", "Spanish: People")).toEqual({
      item: 'What does "la niña" mean?',
      skill: "Spanish: People",
      given: "the boy",
      expected: "the girl",
    });
  });

  it("leaves out empty fields", () => {
    expect(challengeAnswerDetail(mc, "  ")).toEqual({ item: 'What does "la niña" mean?', expected: "the girl" });
  });

  it("describes one match pairing by the left word, with the translation picked", () => {
    expect(matchAnswerDetail(pairs, "w1", "w2", "Latin: Fēminae")).toEqual({
      item: "puella → girl",
      skill: "Latin: Fēminae",
      given: "boy",
      expected: "girl",
    });
    expect(matchAnswerDetail(pairs, "w2", "w2")).toEqual({ item: "puer → boy", given: "boy", expected: "boy" });
    expect(matchAnswerDetail(pairs, "missing", "w1", "s")).toEqual({ skill: "s" });
  });

  it("keeps every string under the portal's 200-character limit", () => {
    const long = "palabra ".repeat(60);
    const clipped = clipAnswerText(long);
    expect(clipped.length).toBe(ANSWER_TEXT_MAX);
    expect(clipped.endsWith("…")).toBe(true);
    expect(clipAnswerText("  a \n b ")).toBe("a b");
    const d = challengeAnswerDetail({ ...mc, prompt: long }, long, long);
    for (const v of Object.values(d)) expect(v.length).toBeLessThanOrEqual(ANSWER_TEXT_MAX);
  });
});
