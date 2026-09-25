import { NextResponse } from "next/server";
import { courseErrorResponse } from "@/lib/auth";

/** Converts the auth/course errors to their JSON status; rethrows anything else. */
export function authFailure(err: unknown): NextResponse {
  const mapped = courseErrorResponse(err);
  if (mapped) return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  throw err;
}

export const EXPECT_USER_HEADER = "x-wordwave-expect-user";

/**
 * A resubmitted completion names the learner who started it (criterion 21). A different
 * verified `sub` means the cookie changed hands; the route answers 409 without writing.
 */
export function expectedUserMismatch(req: Request, userId: string): NextResponse | null {
  const expected = req.headers.get(EXPECT_USER_HEADER);
  if (expected !== null && expected !== userId) {
    return NextResponse.json({ error: "user-mismatch" }, { status: 409 });
  }
  return null;
}
