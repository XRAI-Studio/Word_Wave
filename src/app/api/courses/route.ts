import { NextResponse } from "next/server";
import { requireUser, UnauthorizedError } from "@/lib/auth";
import { db } from "@/lib/db";

// Courses selectable by the current user (for the picker + top-bar swapper),
// plus which one is active. Dev-only/fixture courses are hidden in production.
export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch (err) {
    if (err instanceof UnauthorizedError)
      return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    throw err;
  }

  const isProd = process.env.NODE_ENV === "production";
  const courses = await db.course.findMany({
    where: isProd ? { isAvailable: true } : {},
    orderBy: { order: "asc" },
    select: { code: true, name: true, emblem: true, isAvailable: true },
  });

  return NextResponse.json({ activeCourseCode: user.activeCourseId, courses });
}
