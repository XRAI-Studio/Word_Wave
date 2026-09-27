import { apiFetch } from "@/lib/api-fetch";
import { leaveGuard, type LeaveGuard } from "@/lib/leave-guard";

export type CourseSelectResult = "switched" | "failed" | "leaving";

/**
 * Sets the learner's active course, then enters the path (the course switcher and
 * /welcome). The write is tracked by the leave guard, so "Return to Home Room" waits for
 * it (under the same 2 s deadline); once a departure has begun, no course change starts
 * and a finished one does not send the learner to /learn over the Home Room navigation
 * (Codex WW-HR-002).
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
  if (guard.isDeparting()) return "leaving";
  if (!res.ok) return "failed";
  (o.navigate ?? ((url: string) => window.location.assign(url)))("/learn");
  return "switched";
}
