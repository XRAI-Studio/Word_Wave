// Shared shapes and helpers for course content files.
//
// Each unit provides exactly 6 words and 3 sentences; the seed generator
// turns that into 3 lessons (Lesson 1: first 3 words + sentence 1,
// Lesson 2: last 3 words + sentence 2, Checkpoint: everything + sentence 3).
//
// Sentence rules:
//  - `es` must be reconstructible from its bank tokens (greedy, longest first)
//    joined by single spaces
//  - `words` lists the vocabulary terms exercised (must exist somewhere in
//    the course vocab) so misses feed the SRS
//  - connective tokens (y, es, en, un, el, a, con, mi, por, para, son, …)
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
  es: string;
  en: string;
  bank: string[];
  words: string[];
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
  units: UnitDef[];
}

export const w = (term: string, translation: string): WordDef => ({ term, translation });
export const s = (es: string, en: string, bank: string[], words: string[]): SentenceDef => ({ es, en, bank, words });
