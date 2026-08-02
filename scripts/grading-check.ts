/* Typed-answer grading checks, per course.
 *
 * Guards the language-policy boundary: Spanish must not inherit Latin's
 * orthographic folding, and Latin must grade vowel length. Run with:
 *   npx tsx scripts/grading-check.ts
 */
import { normalizeTyped } from "../src/lib/course-policy";

let failures = 0;

function accepts(course: string, typed: string, expected: string) {
  const ok = normalizeTyped(typed, course) === normalizeTyped(expected, course);
  if (!ok) {
    failures++;
    console.error(`  FAIL [${course}] expected "${typed}" to be ACCEPTED for "${expected}"`);
  }
  return ok;
}

function rejects(course: string, typed: string, expected: string) {
  const ok = normalizeTyped(typed, course) !== normalizeTyped(expected, course);
  if (!ok) {
    failures++;
    console.error(`  FAIL [${course}] expected "${typed}" to be REJECTED for "${expected}"`);
  }
  return ok;
}

console.log("Spanish — j and v are real letters, accents are forgiven");
// The regression this whole change exists to fix: Latin's j/v folding leaked
// into Spanish and accepted these misspellings.
rejects("es", "el trabaio", "el trabajo");
rejects("es", "el hiio", "el hijo");
rejects("es", "el uaso", "el vaso");
rejects("es", "el iardin", "el jardín");
// Long-standing Spanish behavior that must NOT change.
accepts("es", "el trabajo", "el trabajo");
accepts("es", "el avion", "el avión");
accepts("es", "como estas", "¿cómo estás?");
accepts("es", "EL JARDIN", "el jardín");
accepts("es", "manana", "mañana");

console.log("Latin — vowel length is graded, j/v are editorial conventions");
// Macrons are phonemic: these are different words.
rejects("la", "liber", "līber");
rejects("la", "līber", "liber");
rejects("la", "malum", "mālum");
accepts("la", "līber", "līber");
accepts("la", "LĪBER", "līber");
// j/i and v/u remain interchangeable — but the macron must still be typed.
accepts("la", "Iūlius", "Jūlius");
accepts("la", "jūlius", "Iūlius");
accepts("la", "uīta", "vīta");
accepts("la", "vīta", "uīta");
// ...which means the bare-ASCII form is now rejected, since it drops the macron.
rejects("la", "Iulius", "Jūlius");
rejects("la", "vita", "vīta");
// Punctuation and case stay forgiving in both courses.
accepts("la", "servus līber est.", "Servus Līber Est");

if (failures) {
  console.error(`\n${failures} grading check(s) failed.`);
  process.exit(1);
}
console.log("\nAll grading checks passed.");
