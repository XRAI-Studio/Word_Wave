import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { authFailure } from "@/lib/api-errors";
import { db } from "@/lib/db";
import { portalFor } from "@/lib/portal";
import { publishSummary } from "@/lib/progress-service";

const bodySchema = z.object({ courseCode: z.string().min(1).max(8) });

// Set the user's active course (used by the first-run picker and the top-bar
// swapper). Validates the course exists and — in production — is available
// (dev-only/fixture courses can't be selected in prod).
export async function POST(req: Request) {
  let signedIn;
  try {
    signedIn = await requireUser();
  } catch (err) {
    return authFailure(err);
  }
  const { user, token } = signedIn;

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const course = await db.course.findUnique({ where: { code: parsed.data.courseCode } });
  if (!course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }
  if (process.env.NODE_ENV === "production" && !course.isAvailable) {
    return NextResponse.json({ error: "Course not available" }, { status: 403 });
  }

  await db.user.update({ where: { id: user.id }, data: { activeCourseId: course.id } });

  // The launcher tile names the active course, so a switch publishes a new summary
  // (work order criterion 17).
  await publishSummary(portalFor(), { token, userId: user.id });

  return NextResponse.json({ ok: true, activeCourseCode: course.code });
}
