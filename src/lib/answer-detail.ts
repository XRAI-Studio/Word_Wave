// What a graded attempt tells the portal's answer log (`kit.answer`, via `reportAnswer`).
// Pure: the quiz decides right or wrong; these only build the strings it sends.
import type { AnswerDetail } from "@/lib/kit";
import type { ChallengeDTO, MatchMeta } from "@/lib/types";

/** The portal keeps each string under 200 characters. */
export const ANSWER_TEXT_MAX = 200;

/** Collapses whitespace and cuts to the portal's limit, ending a cut string with "…". */
export function clipAnswerText(text: string, max = ANSWER_TEXT_MAX): string {
  const s = text.replace(/\s+/g, " ").trim();
  return s.length <= max ? s : `${s.slice(0, max - 1)}…`;
}

/** A lesson's skill: its course and unit ("Spanish: Greetings", "Latin: Fēminae"). */
export function lessonSkill(courseName: string | undefined, unitTitle: string | undefined): string | undefined {
  const parts = [courseName, unitTitle].map((p) => p?.trim()).filter(Boolean);
  return parts.length ? clipAnswerText(parts.join(": ")) : undefined;
}

/** A review session's skill: its course's due words ("Spanish: review"). */
export function reviewSkill(courseName: string | undefined): string {
  return clipAnswerText(courseName?.trim() ? `${courseName.trim()}: review` : "review");
}

/** Drops empty fields, so the portal never stores a blank item or answer. */
function compact(detail: AnswerDetail): AnswerDetail {
  const out: AnswerDetail = {};
  for (const key of ["item", "skill", "given", "expected"] as const) {
    const v = detail[key] ? clipAnswerText(detail[key]) : "";
    if (v) out[key] = v;
  }
  return out;
}

/**
 * A checked challenge (multiple choice, word bank or typed answer): the prompt is the item
 * (stable across the re-queued retry), `given` what the learner chose, built or typed.
 */
export function challengeAnswerDetail(
  challenge: Exclude<ChallengeDTO, { type: "MATCH" }>,
  given: string,
  skill?: string
): AnswerDetail {
  return compact({ item: challenge.prompt, skill, given, expected: challenge.correctAnswer });
}

/**
 * One pairing in a match challenge: the left tile's word is what was asked
 * ("la niña → the girl"); `given` is the translation tile picked for it.
 */
export function matchAnswerDetail(meta: MatchMeta, leftId: string, rightId: string, skill?: string): AnswerDetail {
  const asked = meta.pairs.find((p) => p.wordId === leftId);
  const picked = meta.pairs.find((p) => p.wordId === rightId);
  if (!asked) return compact({ skill });
  return compact({
    item: `${asked.term} → ${asked.translation}`,
    skill,
    given: picked?.translation,
    expected: asked.translation,
  });
}
