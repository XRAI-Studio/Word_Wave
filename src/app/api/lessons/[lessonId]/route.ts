import { NextResponse } from "next/server";
import { courseErrorResponse, requireActiveCourse } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseChallenge } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  let course;
  try {
    ({ course } = await requireActiveCourse());
  } catch (err) {
    const mapped = courseErrorResponse(err);
    if (mapped) return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    throw err;
  }

  const { lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: {
      challenges: { orderBy: { order: "asc" } },
      unit: { select: { title: true, section: { select: { courseId: true } } } },
    },
  });

  // Not found OR belongs to another course — same 404 (don't leak cross-course ids).
  if (!lesson || lesson.unit.section.courseId !== course.id) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: lesson.id,
    title: lesson.title,
    unitTitle: lesson.unit.title,
    labels: { correct: course.correctLabel, celebrate: course.celebrateLabel },
    challenges: lesson.challenges.map(parseChallenge),
  });
}
