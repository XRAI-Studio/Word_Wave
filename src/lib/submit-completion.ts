import { apiFetch } from "@/lib/api-fetch";
import type { AwardOutcome } from "@/lib/completion";
import type { KitTotals } from "@/lib/kit";
import { savePending, type PendingSubmission } from "@/lib/pending-submission";

/** What both completion routes return (work order criterion 16). */
export interface CompletionResponse {
  /** A repeat of an already-applied submission: nothing was written again. */
  duplicate?: boolean;
  firstCompletion?: boolean;
  award: AwardOutcome;
  /** On a repeat: the learner's totals now (null when the portal did not answer). */
  totals?: KitTotals | null;
}

/**
 * The totals the HUD should show after a completion: a first send's award result, or on
 * a repeat the current totals read with it, never the repeat's historical award result
 * (WW-P5-R4-002, WW-P5-R5-001). Null leaves the HUD as it is.
 */
export function hudTotalsAfter(data: CompletionResponse): KitTotals | null {
  if (data.duplicate) return data.totals ?? null;
  return data.award.result;
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
 * (`X-WordWave-Expect-User`). The caller keeps the submission in sessionStorage before
 * the first send (WW-P5-R5-003); if the session has expired it is kept again here before
 * the browser leaves for the portal (criterion 21). A 202 (the
 * same quiz still finishing elsewhere) is asked again every `pollMs`. Throws
 * `RedirectingError` in that case, `CompletionError` for a refused request, or the
 * network error.
 */
export async function postCompletion(
  p: PendingSubmission,
  o: { pollMs?: number; polls?: number } = {}
): Promise<CompletionResponse> {
  const pollMs = o.pollMs ?? 1500;
  const polls = o.polls ?? 8;
  for (let attempt = 0; ; attempt++) {
    const res = await apiFetch(
      p.url,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-WordWave-Expect-User": p.userId },
        body: JSON.stringify(p.body),
      },
      { beforeRedirect: () => savePending(window.sessionStorage, p) }
    );
    // 202: an earlier send of this same quiz is still finishing (WW-P5-R4-001). Ask
    // again until its outcome is recorded; the server never applies it twice.
    if (res.status === 202) {
      if (attempt >= polls) throw new CompletionError(202, "pending");
      await new Promise((r) => setTimeout(r, pollMs));
      continue;
    }
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: unknown } | null;
      throw new CompletionError(res.status, typeof body?.error === "string" ? body.error : null);
    }
    return res.json();
  }
}
