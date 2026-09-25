import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveCourse } from "@/lib/auth";
import { authFailure, expectedUserMismatch } from "@/lib/api-errors";
import { awardOutcome, shouldAwardReview, SKIPPED, type AwardOutcome } from "@/lib/completion";
import { db } from "@/lib/db";
import { portalFor } from "@/lib/portal";
import { completeReview, publishSummary, recordOutcome } from "@/lib/progress-service";

const bodySchema = z.object({
  results: z.array(z.object({ wordId: z.string(), correct: z.boolean() })),
  // One id per review session, kept across retries: a repeat applies nothing twice.
  submissionId: z.string().uuid(),
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

  const outcome = await completeReview(user.id, results, parsed.data.submissionId);
  if (outcome.duplicate) {
    return NextResponse.json({ duplicate: true, award: outcome.recorded ?? SKIPPED });
  }
  const { applied } = outcome;

  // One `review_session` award per session, not per word (seed: 10 XP, 5 a day), and
  // only when the SRS scheduled something (WW-INSPECT-001).
  const portal = portalFor();
  const who = { token, userId: user.id };
  let award: AwardOutcome = SKIPPED;
  if (shouldAwardReview(applied)) {
    award = awardOutcome(await portal.award(who, "review_session", { words: applied, course: course.code }));
    await recordOutcome(user.id, parsed.data.submissionId, award);
    await publishSummary(portal, who);
  }

  return NextResponse.json({ award });
}
