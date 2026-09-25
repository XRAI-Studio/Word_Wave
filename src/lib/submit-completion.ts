import { apiFetch } from "@/lib/api-fetch";
import type { AwardOutcome } from "@/lib/completion";
import { savePending, type PendingSubmission } from "@/lib/pending-submission";

/** What both completion routes return (work order criterion 16). */
export interface CompletionResponse {
  firstCompletion?: boolean;
  award: AwardOutcome;
}

/** A completion the server refused, with its `error` code (e.g. `user-mismatch`). */
export class CompletionError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | null
  ) {
    super(`completion failed: ${status}${code ? ` ${code}` : ""}`);
  }
}

/**
 * POSTs a finished quiz (or a kept one after sign-in). It names the learner who answered
 * (`X-WordWave-Expect-User`), and if the session has expired it keeps the submission for
 * the return trip before the browser leaves for the portal (criterion 21). Throws
 * `RedirectingError` in that case, `CompletionError` for a refused request, or the
 * network error.
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
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
    throw new CompletionError(res.status, typeof body?.error === "string" ? body.error : null);
  }
  return res.json();
}
