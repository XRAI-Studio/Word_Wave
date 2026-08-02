// Per-course language policy.
//
// THE RULE: anything that differs by language lives here or on the Course row.
// No shared function may hard-code one language's conventions.
//
// This module exists because that rule was broken once already: j→i / v→u
// folding was added to the shared typed-answer comparison to serve Latin
// orthography, and it silently applied to Spanish too — accepting "el trabaio"
// for "el trabajo" across the 86 Spanish Level 3 terms containing j or v.

export interface CoursePolicy {
  /**
   * Fold diacritics away before comparing typed answers.
   *
   * Spanish: true — the course has always graded accent-insensitively
   * ("como estas" matches "¿cómo estás?"), and tightening it now would regress
   * learners mid-course.
   *
   * Latin: false — vowel length is phonemic, not decorative. "liber" (book)
   * and "līber" (free) are different words, so a macron is part of the answer.
   */
  foldDiacritics: boolean;

  /**
   * Treat j/i and v/u as the same letter.
   *
   * Latin: true — consonantal i and u are written j and v purely by editorial
   * convention, so "Iulius" and "uita" must be accepted for "Jūlius"/"vīta".
   *
   * Spanish: false — j and v are distinct letters. Folding them accepts
   * misspellings as correct.
   */
  foldJiVu: boolean;
}

const POLICIES: Record<string, CoursePolicy> = {
  es: { foldDiacritics: true, foldJiVu: false },
  la: { foldDiacritics: false, foldJiVu: true },
};

// Spanish is the fallback: it is the original course, and it matches the
// existing default labels used when a payload omits course metadata.
const FALLBACK: CoursePolicy = POLICIES.es;

export function policyFor(courseCode: string | undefined | null): CoursePolicy {
  return (courseCode && POLICIES[courseCode]) || FALLBACK;
}

// Combining diacritical marks (U+0300–U+036F) — what NFD splits accents into.
const COMBINING = /[̀-ͯ]/g;
const ALLOWED_FOLDED = /[^a-z0-9ñ\s]/gi;
const ALLOWED_WITH_MARKS = /[^a-z0-9ñ̀-ͯ\s]/gi;

/**
 * Forgiving comparison for typed answers, scoped to one course's conventions.
 * Case- and punctuation-insensitive always; diacritic and j/v handling come
 * from the course policy. Applied to both sides of a comparison, so it only
 * ever broadens acceptance — never rejects a correct answer.
 */
export function normalizeTyped(value: string, courseCode?: string | null): string {
  const { foldDiacritics, foldJiVu } = policyFor(courseCode);

  let out = value.toLowerCase().normalize("NFD");
  if (foldDiacritics) out = out.replace(COMBINING, "");
  if (foldJiVu) out = out.replace(/j/g, "i").replace(/v/g, "u");

  return out
    // When diacritics are meaningful they must survive punctuation stripping,
    // so the allowed set has to include the combining marks themselves.
    .replace(foldDiacritics ? ALLOWED_FOLDED : ALLOWED_WITH_MARKS, " ")
    .replace(/\s+/g, " ")
    .trim()
    .normalize("NFC");
}
