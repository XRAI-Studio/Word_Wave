import { apiFetch } from "@/lib/api-fetch";
import { leaveGuard, type LeaveGuard } from "@/lib/leave-guard";

export type CourseSelectResult = "switched" | "failed" | "leaving";

/**
 * Sets the learner's active course, then enters the path (the course switcher and
 * /welcome). The write is tracked by the leave guard, so "Return to Home Room" waits for
 * it (under the same 2 s deadline); once a departure has begun, no course change starts
 * and one already under way never sends the learner to /learn over the Home Room
 * navigation, however late it finishes (Codex WW-HR-002, WW-HR-003).
 */
export async function selectCourse(
  code: string,
  o: {
    guard?: LeaveGuard;
    post?: (code: string) => Promise<Response>;
    navigate?: (url: string) => void;
  } = {}
): Promise<CourseSelectResult> {
  const guard = o.guard ?? leaveGuard;
  if (guard.isDeparting()) return "leaving";
  // A departure started at any point after this, even one that has since stalled and been
  // reset, cancels the navigation to /learn for good (Codex WW-HR-003).
  const generation = guard.departureCount();
  const post =
    o.post ??
    ((c: string) =>
      apiFetch("/api/course/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode: c }),
      }));
  let res: Response;
  try {
    res = await guard.track(post(code));
  } catch {
    return "failed";
  }
  if (guard.isDeparting() || guard.departureCount() !== generation) return "leaving";
  if (!res.ok) return "failed";
  (o.navigate ?? ((url: string) => window.location.assign(url)))("/learn");
  return "switched";
}
