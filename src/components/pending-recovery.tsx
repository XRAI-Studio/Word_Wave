"use client";

import { useEffect, useRef, useState } from "react";
import { ChunkyButton } from "@/components/chunky-button";
import { useKit } from "@/components/kit-provider";
import { ResultScreen } from "@/components/quiz/result-screen";
import { apiFetch, RedirectingError } from "@/lib/api-fetch";
import type { AwardOutcome } from "@/lib/completion";
import { belongsTo, clearPending, hasPendingFor, peekPending, type PendingSubmission } from "@/lib/pending-submission";
import { useGameStore } from "@/lib/store";
import { CompletionError, postCompletion } from "@/lib/submit-completion";
import type { UserDTO } from "@/lib/types";

type State =
  | { kind: "checking" }
  | { kind: "none" }
  | { kind: "failed" }
  | { kind: "done"; award: AwardOutcome; accuracy: number };

/**
 * Resolves a quiz submission kept across a portal sign-in (work order criterion 21), at
 * route level and before the page loads anything else, whether or not the lesson still
 * loads or any review is still due. The submission stays stored until it is sent or
 * discarded, so a reload never loses or repeats it:
 * - the server's current learner and active course are fetched first; a lookup failure
 *   keeps the submission and offers a retry, never a discard;
 * - a different learner or course discards it unsent;
 * - a successful send removes it; a `user-mismatch` refusal (the cookie changed hands
 *   after the check) discards it; any other failure keeps it for Try again, which
 *   repeats the whole check before resending.
 */
export function PendingRecovery({ mode, children }: { mode: "lesson" | "review"; children: React.ReactNode }) {
  const kit = useKit();
  const applyAward = useGameStore((st) => st.applyAward);
  // Rendered only on the client, once the kit is ready (inside KitProvider).
  const [state, setState] = useState<State>(() =>
    kit.user && hasPendingFor(window.sessionStorage, window.location.pathname) ? { kind: "checking" } : { kind: "none" }
  );

  /** Checks the learner and course, then sends; every state change follows an await. */
  async function run(pending: PendingSubmission) {
    const storage = window.sessionStorage;
    const path = window.location.pathname;
    let me: UserDTO;
    try {
      const res = await apiFetch("/api/user");
      if (!res.ok) throw new Error(`profile ${res.status}`);
      me = await res.json();
    } catch (err) {
      if (!(err instanceof RedirectingError)) setState({ kind: "failed" });
      return;
    }
    if (!belongsTo(pending, { userId: me.id, courseCode: me.activeCourseCode })) {
      clearPending(storage, path);
      setState({ kind: "none" });
      return;
    }

    try {
      const data = await postCompletion(pending);
      clearPending(storage, path);
      // A repeat carries the first send's historical totals; the HUD keeps the current
      // ones, hydrated fresh when this page loaded (WW-P5-R4-002).
      if (data.award.result && !data.duplicate) applyAward(data.award.result);
      setState({ kind: "done", award: data.award, accuracy: pending.accuracy });
    } catch (err) {
      if (err instanceof RedirectingError) return;
      if (err instanceof CompletionError && err.code === "user-mismatch") {
        clearPending(storage, path);
        setState({ kind: "none" });
        return;
      }
      setState({ kind: "failed" });
    }
  }

  function retry() {
    const pending = peekPending(window.sessionStorage, window.location.pathname);
    if (!pending) {
      setState({ kind: "none" });
      return;
    }
    setState({ kind: "checking" });
    void run(pending);
  }

  // Development's StrictMode runs mount effects twice; the submission stays stored until
  // it is sent, so without this guard it would be sent twice (harmless for the ledger,
  // since a replay awards nothing, but the second answer would win the screen).
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const pending = peekPending(window.sessionStorage, window.location.pathname);
    // `run` sets state only after its first await (an external fetch), which is what
    // this rule is meant to allow; it cannot see that through the function call.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pending && kit.user) void run(pending);
    // Once per mount of the route; Try again calls `retry`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state.kind === "none") return <>{children}</>;
  if (state.kind === "done") return <ResultScreen award={state.award} mode={mode} accuracy={state.accuracy} />;
  if (state.kind === "failed") {
    return (
      <div
        className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center"
        data-testid="recovery-failed"
      >
        <p className="font-display text-xl font-extrabold">Couldn&apos;t save your answers yet</p>
        <p className="text-ink-soft">They are kept on this page. Check your connection and try again.</p>
        <ChunkyButton onClick={retry}>Try again</ChunkyButton>
      </div>
    );
  }
  return (
    <div className="p-10 text-center font-display font-bold text-ink-soft" aria-live="polite">
      Saving your answers…
    </div>
  );
}
