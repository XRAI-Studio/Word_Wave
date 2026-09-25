import { NextResponse } from "next/server";
import { isMockSession, requireUser } from "@/lib/auth";
import { authFailure } from "@/lib/api-errors";
import { db } from "@/lib/db";
import { mockPortal } from "@/lib/portal";
import type { UserDTO } from "@/lib/types";

// Profile data. XP, streak and gems come from the kit (the school ledger), except in the
// dev mock session, where the server's mock portal is the only reward state and is
// returned as `devTotals`, with the launcher summary as `devSummary` (work order
// criteria 17 and 20).
export async function GET() {
  let user;
  try {
    ({ user } = await requireUser());
  } catch (err) {
    return authFailure(err);
  }
  const [lessonsCompleted, course] = await Promise.all([
    db.lessonProgress.count({ where: { userId: user.id, completed: true } }),
    user.activeCourseId ? db.course.findUnique({ where: { id: user.activeCourseId } }) : null,
  ]);
  const body: UserDTO = {
    id: user.id,
    displayName: user.displayName,
    createdAt: user.createdAt.toISOString(),
    lessonsCompleted,
    activeCourseName: course?.name ?? null,
    activeCourseCode: course?.code ?? null,
    ...(isMockSession()
      ? { devTotals: mockPortal().totals(user.id), devSummary: mockPortal().summary(user.id) }
      : {}),
  };
  return NextResponse.json(body);
}
