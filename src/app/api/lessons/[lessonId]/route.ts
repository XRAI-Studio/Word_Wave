import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseChallenge } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id: lessonId },
    include: { challenges: { orderBy: { order: "asc" } }, unit: { select: { title: true } } },
  });

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: lesson.id,
    title: lesson.title,
    unitTitle: lesson.unit.title,
    challenges: lesson.challenges.map(parseChallenge),
  });
}
