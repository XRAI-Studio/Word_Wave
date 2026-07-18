import { NextResponse } from "next/server";
import { courseErrorResponse, requireActiveCourse } from "@/lib/auth";
import { db } from "@/lib/db";

// Sections + units + lessons + completion state for the active course; drives
// the learn path screen.
export async function GET() {
  let user, course;
  try {
    ({ user, course } = await requireActiveCourse());
  } catch (err) {
    const mapped = courseErrorResponse(err);
    if (mapped) return NextResponse.json({ error: mapped.error }, { status: mapped.status });
    throw err;
  }

  const [sections, progress] = await Promise.all([
    db.section.findMany({
      where: { courseId: course.id },
      orderBy: { order: "asc" },
      include: {
        units: {
          orderBy: { order: "asc" },
          include: {
            lessons: { orderBy: { order: "asc" }, select: { id: true, title: true, order: true } },
          },
        },
      },
    }),
    db.lessonProgress.findMany({ where: { userId: user.id, completed: true } }),
  ]);

  const completedIds = new Set(progress.map((p) => p.lessonId));

  // First uncompleted lesson across the whole course is the active one.
  let activeLessonId: string | null = null;
  outer: for (const section of sections) {
    for (const unit of section.units) {
      for (const lesson of unit.lessons) {
        if (!completedIds.has(lesson.id)) {
          activeLessonId = lesson.id;
          break outer;
        }
      }
    }
  }

  return NextResponse.json({
    activeLessonId,
    course: { code: course.code, name: course.name },
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
      level: section.level,
      fillBlank: section.fillBlank,
      units: section.units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        description: unit.description,
        lessons: unit.lessons.map((lesson) => ({
          id: lesson.id,
          title: lesson.title,
          completed: completedIds.has(lesson.id),
        })),
      })),
    })),
  });
}
