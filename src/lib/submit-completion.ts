import { apiFetch } from "@/lib/api-fetch";
import type { AwardOutcome } from "@/lib/completion";
import { savePending, type PendingSubmission } from "@/lib/pending-submission";

/** What both completion routes return (work order criterion 16). */
export interface CompletionResponse {
  firstCompletion?: boolean;
  award: AwardOutcome;
}

/**
 * POSTs a finished quiz (or a kept one after sign-in). It names the learner who answered
 * (`X-WordWave-Expect-User`), and if the session has expired it keeps the submission for
 * the return trip before the browser leaves for the portal (criterion 21). Throws
 * `RedirectingError` in that case, or an Error on any other failure.
 */
export async function postCompletion(p: PendingSubmission): Promise<CompletionResponse> {
  const res = await apiFetch(
    p.url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-WordWave-Expect-User": p.userId },
      body: JSON.stringify(p.body),
    },
    { beforeRedirect: () => savePending(window.sessionStorage, p) }
  );
  if (!res.ok) throw new Error(String(res.status));
  return res.json();
}
