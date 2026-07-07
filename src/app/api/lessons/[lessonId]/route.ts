import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseChallenge } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

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
