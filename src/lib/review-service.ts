import type { Prisma, PrismaClient } from "@prisma/client";
import { initialFailedState, scheduleNext } from "@/lib/srs";

export interface WordResult {
  wordId: string;
  correct: boolean;
}

// Apply SRS results to WordReview rows and return how many words were scheduled. Failed words without a review row get
// one (they enter the review rotation); correct words only update existing rows.
// Runs on the caller's client: the completion routes pass their transaction so the
// progress transition and these writes commit together (work order criterion 14).
export async function applySrsResults(
  db: Prisma.TransactionClient | PrismaClient,
  userId: string,
  results: WordResult[],
  now = new Date()
): Promise<number> {
  // Last result wins if a word appears multiple times in one session... unless
  // it was ever wrong, in which case wrong wins (Duolingo re-queues misses).
  const merged = new Map<string, boolean>();
  for (const r of results) {
    merged.set(r.wordId, (merged.get(r.wordId) ?? true) && r.correct);
  }

  let applied = 0;
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
      applied++;
    } else if (!correct) {
      const word = await db.word.findUnique({ where: { id: wordId } });
      if (!word) continue; // unknown word id — ignore rather than fail the request
      // skipDuplicates (ON CONFLICT DO NOTHING): a concurrent submission of the same
      // lesson may have just created this row; a plain create would abort the transaction.
      await db.wordReview.createMany({
        data: [{ userId, wordId, ...initialFailedState(now) }],
        skipDuplicates: true,
      });
      applied++;
    }
  }
  // Words the SRS actually scheduled: a correct answer for a word with no review row
  // changes nothing and must not count as reviewed (review award, WW-INSPECT-001).
  return applied;
}
