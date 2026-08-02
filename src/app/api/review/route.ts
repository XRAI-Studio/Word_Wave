import { NextResponse } from "next/server";
import { courseErrorResponse, requireActiveCourse } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ChallengeDTO } from "@/lib/types";

const SESSION_CAP = 10;

// Words due for review in the active course, synthesized into MC challenges.
export async function GET() {
  let user, course;
  try {
    ({ user, course } = await requireActiveCourse());
  } catch (err) {
    const mapped = courseErrorResponse(err);
    if (mapped) return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    throw err;
  }

  // Only words in the active course are due / eligible — never mix courses.
  const due = await db.wordReview.findMany({
    where: { userId: user.id, dueAt: { lte: new Date() }, word: { courseId: course.id } },
    orderBy: { dueAt: "asc" },
    include: { word: true },
  });

  const session = due.slice(0, SESSION_CAP);
  const allWords = await db.word.findMany({ where: { courseId: course.id } });

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

  return NextResponse.json({
    dueCount: due.length,
    courseCode: course.code,
    labels: { correct: course.correctLabel, celebrate: course.celebrateLabel },
    challenges,
  });
}

function shuffle<T>(arr: T[], salt: number): T[] {
  const k = (salt + arr.length) % arr.length;
  return [...arr.slice(k), ...arr.slice(0, k)];
}
