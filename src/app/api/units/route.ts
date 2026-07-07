import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LOCAL_USER_ID } from "@/lib/user-service";

// Sections + units + lessons + completion state; drives the learn path screen.
export async function GET() {
  const [sections, progress] = await Promise.all([
    db.section.findMany({
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
    db.lessonProgress.findMany({ where: { userId: LOCAL_USER_ID, completed: true } }),
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
    sections: sections.map((section) => ({
      id: section.id,
      title: section.title,
      description: section.description,
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
