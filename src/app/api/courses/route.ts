import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { authFailure } from "@/lib/api-errors";
import { db } from "@/lib/db";

// Courses selectable by the current user (for the picker + top-bar swapper),
// plus which one is active. Dev-only/fixture courses are hidden in production.
export async function GET() {
  let user;
  try {
    ({ user } = await requireUser());
  } catch (err) {
    return authFailure(err);
  }

  const isProd = process.env.NODE_ENV === "production";
  const courses = await db.course.findMany({
    where: isProd ? { isAvailable: true } : {},
    orderBy: { order: "asc" },
    select: { code: true, name: true, emblem: true, isAvailable: true },
  });

  return NextResponse.json({ activeCourseCode: user.activeCourseId, courses });
}
