import { describe, expect, it, vi } from "vitest";
import { applySrsResults } from "@/lib/review-service";

// A minimal stand-in for the Prisma transaction client: one existing review row for w1.
function fakeTx() {
  const existing = { id: "r1", userId: "u", wordId: "w1", interval: 1, easeFactor: 2.5, dueAt: new Date(0), lapses: 1, lastResult: "wrong" };
  return {
    wordReview: {
      findUnique: vi.fn(async ({ where }: { where: { userId_wordId: { wordId: string } } }) =>
        where.userId_wordId.wordId === "w1" ? existing : null
      ),
      update: vi.fn(async () => ({})),
      createMany: vi.fn(async () => ({ count: 1 })),
    },
    word: { findUnique: vi.fn(async ({ where }: { where: { id: string } }) => (where.id === "gone" ? null : { id: where.id })) },
  };
}

describe("applySrsResults counts what it scheduled (WW-INSPECT-001)", () => {
  it("counts an update of an existing row and a new row for a miss", async () => {
    const tx = fakeTx();
    const n = await applySrsResults(tx as never, "u", [
      { wordId: "w1", correct: true },
      { wordId: "w2", correct: false },
    ]);
    expect(n).toBe(2);
    expect(tx.wordReview.update).toHaveBeenCalledOnce();
    expect(tx.wordReview.createMany).toHaveBeenCalledOnce();
  });

  it("counts nothing for a correct answer on a word that has no review row", async () => {
    const tx = fakeTx();
    expect(await applySrsResults(tx as never, "u", [{ wordId: "w9", correct: true }])).toBe(0);
    expect(tx.wordReview.update).not.toHaveBeenCalled();
    expect(tx.wordReview.createMany).not.toHaveBeenCalled();
  });

  it("counts nothing for an unknown word", async () => {
    expect(await applySrsResults(fakeTx() as never, "u", [{ wordId: "gone", correct: false }])).toBe(0);
  });

  it("counts a word once however often it appears", async () => {
    const n = await applySrsResults(fakeTx() as never, "u", [
      { wordId: "w1", correct: true },
      { wordId: "w1", correct: false },
    ]);
    expect(n).toBe(1);
  });
});
