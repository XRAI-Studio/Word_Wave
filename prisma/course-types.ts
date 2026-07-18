// Shared shapes and helpers for course content files.
//
// Each unit provides exactly 6 words and 3 sentences; the seed generator
// turns that into 3 lessons (Lesson 1: first 3 words + sentence 1,
// Lesson 2: last 3 words + sentence 2, Checkpoint: everything + sentence 3).
//
// Sentence rules:
//  - `target` (the sentence in the course's target language) must be
//    reconstructible from its bank tokens (greedy, longest first), joined by
//    single spaces. `targetTokens` is the exact ordered token list and must
//    satisfy `target === targetTokens.join(" ")`.
//  - `words` lists the vocabulary terms exercised (must exist somewhere in
//    the course vocab) so misses feed the SRS
//  - connective tokens (y, es, en, un, el… in Spanish; et, est, in… in Latin)
//    are fine in banks without being vocabulary
//
// Sections flagged `fillBlank: true` (Level 3) generate typed-answer
// challenges instead of multiple choice, and may only reuse words already
// taught by non-fillBlank sections.

export interface WordDef {
  term: string;
  translation: string;
}

export interface SentenceDef {
  target: string; // the sentence in the course's target language
  en: string;
  bank: string[];
  words: string[];
  targetTokens: string[]; // every rendered token, in order; target === targetTokens.join(" ")
}

export interface UnitDef {
  title: string;
  description: string;
  words: WordDef[];
  sentences: [SentenceDef, SentenceDef, SentenceDef];
}

export interface SectionDef {
  id: string;
  title: string;
  description: string;
  fillBlank?: boolean;
  level?: number; // 1/2/3 — assigned by the aggregator when omitted in a level file
  units: UnitDef[];
}

// Course-level metadata + its section tree. Seeded into the Course table.
export interface CourseDef {
  code: string; // "es", "la"
  name: string; // display name
  promptLanguageName: string; // fills "Type the {X} for …"
  emblem: string; // swap-control emblem (flag / classical building)
  order: number;
  correctLabel: string; // per-answer affirmation
  celebrateLabel: string; // end-of-session celebration
  isAvailable: boolean; // false = dev-only/fixture course, hidden in production
  sections: SectionDef[];
}

// Greedy longest-token-first reconstruction; mirrors how the quiz assembles
// the sentence from its bank. Returns the ordered token list, or throws.
export function tokenizeSentence(target: string, bank: string[]): string[] {
  const tokens: string[] = [];
  let rest = target;
  while (rest.length) {
    const hit = [...bank]
      .filter((t) => rest === t || rest.startsWith(t + " "))
      .sort((a, b) => b.length - a.length)[0];
    if (!hit)
      throw new Error(`Sentence "${target}" is not constructible from its bank at "${rest}"`);
    tokens.push(hit);
    rest = rest.slice(hit.length).trimStart();
  }
  return tokens;
}

export const w = (term: string, translation: string): WordDef => ({ term, translation });

// Build a sentence. `tokens` may be given explicitly (preferred for inflected
// languages like Latin); otherwise it is derived greedily from the bank. Either
// way we assert target === tokens.join(" ") and every token is in the bank.
export const s = (
  target: string,
  en: string,
  bank: string[],
  words: string[],
  tokens?: string[]
): SentenceDef => {
  const targetTokens = tokens ?? tokenizeSentence(target, bank);
  if (target !== targetTokens.join(" "))
    throw new Error(`Sentence "${target}" != tokens.join(" ") ("${targetTokens.join(" ")}")`);
  for (const t of targetTokens)
    if (!bank.includes(t))
      throw new Error(`Sentence "${target}" token "${t}" missing from its bank`);
  return { target, en, bank, words, targetTokens };
};
