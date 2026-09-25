import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveCourse } from "@/lib/auth";
import { authFailure, expectedUserMismatch } from "@/lib/api-errors";
import { awardOutcome, shouldAwardReview, SKIPPED, type AwardOutcome } from "@/lib/completion";
import { db } from "@/lib/db";
import { portalFor } from "@/lib/portal";
import { completeReview, publishSummary } from "@/lib/progress-service";

const bodySchema = z.object({
  results: z.array(z.object({ wordId: z.string(), correct: z.boolean() })),
});

export async function POST(req: Request) {
  let signedIn;
  try {
    signedIn = await requireActiveCourse();
  } catch (err) {
    return authFailure(err);
  }
  const { user, course, token } = signedIn;
  const mismatch = expectedUserMismatch(req, user.id);
  if (mismatch) return mismatch;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  // Drop any results for words outside the active course before touching SRS.
  const owned = new Set(
    (
      await db.word.findMany({
        where: { courseId: course.id, id: { in: parsed.data.results.map((r) => r.wordId) } },
        select: { id: true },
      })
    ).map((w) => w.id)
  );
  const results = parsed.data.results.filter((r) => owned.has(r.wordId));

  const applied = await completeReview(user.id, results);

  // One `review_session` award per session, not per word (seed: 10 XP, 5 a day), and
  // only when the SRS scheduled something (WW-INSPECT-001).
  const portal = portalFor();
  const who = { token, userId: user.id };
  let award: AwardOutcome = SKIPPED;
  if (shouldAwardReview(applied)) {
    award = awardOutcome(await portal.award(who, "review_session", { words: applied, course: course.code }));
    await publishSummary(portal, who);
  }

  return NextResponse.json({ award });
}
