import { db } from "@/lib/db";
import { initialFailedState, scheduleNext } from "@/lib/srs";

export interface WordResult {
  wordId: string;
  correct: boolean;
}

// Apply SRS results to WordReview rows. Failed words without a review row get
// one (they enter the review rotation); correct words only update existing rows.
export async function applySrsResults(userId: string, results: WordResult[], now = new Date()) {
  // Last result wins if a word appears multiple times in one session... unless
  // it was ever wrong, in which case wrong wins (Duolingo re-queues misses).
  const merged = new Map<string, boolean>();
  for (const r of results) {
    merged.set(r.wordId, (merged.get(r.wordId) ?? true) && r.correct);
  }

  for (const [wordId, correct] of merged) {
    const existing = await db.wordReview.findUnique({
      where: { userId_wordId: { userId, wordId } },
    });

    if (existing) {
      const next = scheduleNext(existing, correct, now);
      await db.wordReview.update({
        where: { id: existing.id },
        data: { ...next },
      });
    } else if (!correct) {
      const word = await db.word.findUnique({ where: { id: wordId } });
      if (!word) continue; // unknown word id — ignore rather than fail the request
      await db.wordReview.create({ data: { userId, wordId, ...initialFailedState(now) } });
    }
  }
}
