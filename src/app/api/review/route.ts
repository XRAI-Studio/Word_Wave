import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ChallengeDTO } from "@/lib/types";

const SESSION_CAP = 10;

// Words due for review, synthesized into multiple-choice challenges.
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const due = await db.wordReview.findMany({
    where: { userId: sessionUser.id, dueAt: { lte: new Date() } },
    orderBy: { dueAt: "asc" },
    include: { word: true },
  });

  const session = due.slice(0, SESSION_CAP);
  const allWords = await db.word.findMany();

  const challenges: ChallengeDTO[] = session.map((review, i) => {
    const others = allWords.filter((w) => w.id !== review.wordId);
    // Deterministic-ish distractor pick, varied per position.
    const distractors = [0, 1, 2].map((k) => others[(i * 3 + k * 7) % others.length]);
    const askTerm = i % 2 === 0; // alternate direction

    if (askTerm) {
      return {
        id: `review-${review.wordId}`,
        order: i + 1,
        type: "MULTIPLE_CHOICE",
        prompt: `Which means "${review.word.translation}"?`,
        correctAnswer: review.word.term,
        meta: {
          choices: shuffle([review.word.term, ...distractors.map((d) => d.term)], i),
          wordIds: [review.wordId],
        },
      };
    }
    return {
      id: `review-${review.wordId}`,
      order: i + 1,
      type: "MULTIPLE_CHOICE",
      prompt: `What does "${review.word.term}" mean?`,
      correctAnswer: review.word.translation,
      meta: {
        choices: shuffle([review.word.translation, ...distractors.map((d) => d.translation)], i),
        wordIds: [review.wordId],
      },
    };
  });

  return NextResponse.json({ dueCount: due.length, challenges });
}

function shuffle<T>(arr: T[], salt: number): T[] {
  const k = (salt + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}
