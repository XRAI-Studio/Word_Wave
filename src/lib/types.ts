import { z } from "zod";

export const CHALLENGE_TYPES = ["MULTIPLE_CHOICE", "TRANSLATE", "MATCH", "FILL_BLANK"] as const;
export type ChallengeType = (typeof CHALLENGE_TYPES)[number];

// Type-specific payloads stored as JSON text in Challenge.meta.
// Every payload carries wordIds so missed answers can feed the SRS.

export const multipleChoiceMeta = z.object({
  choices: z.array(z.string()).min(2),
  wordIds: z.array(z.string()),
});

export const translateMeta = z.object({
  wordBank: z.array(z.string()).min(2),
  wordIds: z.array(z.string()),
});

export const matchMeta = z.object({
  pairs: z
    .array(z.object({ term: z.string(), translation: z.string(), wordId: z.string() }))
    .min(2),
  wordIds: z.array(z.string()),
});

export const fillBlankMeta = z.object({
  wordIds: z.array(z.string()),
});

export type MultipleChoiceMeta = z.infer<typeof multipleChoiceMeta>;
export type TranslateMeta = z.infer<typeof translateMeta>;
export type MatchMeta = z.infer<typeof matchMeta>;
export type FillBlankMeta = z.infer<typeof fillBlankMeta>;

export type ChallengeDTO =
  | { id: string; order: number; prompt: string; correctAnswer: string; type: "MULTIPLE_CHOICE"; meta: MultipleChoiceMeta }
  | { id: string; order: number; prompt: string; correctAnswer: string; type: "TRANSLATE"; meta: TranslateMeta }
  | { id: string; order: number; prompt: string; correctAnswer: string; type: "MATCH"; meta: MatchMeta }
  | { id: string; order: number; prompt: string; correctAnswer: string; type: "FILL_BLANK"; meta: FillBlankMeta };

export function parseChallenge(row: {
  id: string;
  order: number;
  prompt: string;
  correctAnswer: string;
  type: string;
  meta: string;
}): ChallengeDTO {
  const raw = JSON.parse(row.meta);
  const base = {
    id: row.id,
    order: row.order,
    prompt: row.prompt,
    correctAnswer: row.correctAnswer,
  };
  switch (row.type) {
    case "MULTIPLE_CHOICE":
      return { ...base, type: "MULTIPLE_CHOICE", meta: multipleChoiceMeta.parse(raw) };
    case "TRANSLATE":
      return { ...base, type: "TRANSLATE", meta: translateMeta.parse(raw) };
    case "MATCH":
      return { ...base, type: "MATCH", meta: matchMeta.parse(raw) };
    case "FILL_BLANK":
      return { ...base, type: "FILL_BLANK", meta: fillBlankMeta.parse(raw) };
    default:
      throw new Error(`Unknown challenge type: ${row.type}`);
  }
}

export interface UserDTO {
  id: string;
  email: string | null;
  displayName: string | null;
  isGuest: boolean;
  createdAt: string;
  xp: number;
  streakCount: number;
  lastActiveDate: string | null;
  gems: number;
  streakFreezes: number;
  lessonsCompleted: number;
}

export interface QuestDTO {
  key: string;
  title: string;
  target: number;
  progress: number;
  completed: boolean;
}
