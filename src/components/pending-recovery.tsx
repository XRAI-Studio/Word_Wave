"use client";

import { useEffect, useState } from "react";
import { ChunkyButton } from "@/components/chunky-button";
import { useKit } from "@/components/kit-provider";
import { ResultScreen } from "@/components/quiz/result-screen";
import { apiFetch, RedirectingError } from "@/lib/api-fetch";
import type { AwardOutcome } from "@/lib/completion";
import { hasPendingFor, savePending, takePending, type PendingSubmission } from "@/lib/pending-submission";
import { useGameStore } from "@/lib/store";
import { postCompletion } from "@/lib/submit-completion";
import type { UserDTO } from "@/lib/types";

type State =
  | { kind: "checking" }
  | { kind: "none" }
  | { kind: "sending"; pending: PendingSubmission }
  | { kind: "failed"; pending: PendingSubmission }
  | { kind: "done"; award: AwardOutcome; accuracy: number };

/**
 * Resolves a quiz submission kept across a portal sign-in (work order criterion 21),
 * at route level and before the page loads anything else (WW-INSPECT-003): it is sent
 * once when this route belongs to the same learner and active course, and discarded
 * otherwise, whether or not the lesson still loads or any review is still due. A failed
 * send keeps the exact payload (in state and in storage) and offers a retry of it
 * (WW-INSPECT-002).
 */
export function PendingRecovery({ mode, children }: { mode: "lesson" | "review"; children: React.ReactNode }) {
  const kit = useKit();
  const applyAward = useGameStore((st) => st.applyAward);
  // Rendered only on the client, once the kit is ready (inside KitProvider).
  const [state, setState] = useState<State>(() =>
    kit.user && hasPendingFor(window.sessionStorage, window.location.pathname) ? { kind: "checking" } : { kind: "none" }
  );

  async function send(pending: PendingSubmission) {
    setState({ kind: "sending", pending });
    try {
      const data = await postCompletion(pending);
      if (data.award.result) applyAward(data.award.result);
      setState({ kind: "done", award: data.award, accuracy: pending.accuracy });
    } catch (err) {
      if (err instanceof RedirectingError) return;
      // Keep it stored too, so a reload retries it rather than losing it.
      savePending(window.sessionStorage, pending);
      setState({ kind: "failed", pending });
    }
  }

  useEffect(() => {
    if (state.kind !== "checking" || !kit.user) return;
    let cancelled = false;
    const path = window.location.pathname;
    const userId = kit.user.id;
    (async () => {
      try {
        const res = await apiFetch("/api/user");
        const me: UserDTO | null = res.ok ? await res.json() : null;
        if (cancelled) return;
        const pending = takePending(window.sessionStorage, { path, userId, courseCode: me?.activeCourseCode ?? "" });
        if (pending) void send(pending);
        else setState({ kind: "none" });
      } catch (err) {
        if (!cancelled && !(err instanceof RedirectingError)) setState({ kind: "none" });
      }
    })();
    return () => {
      cancelled = true;
    };
    // Once per mount of the route; `send` only uses setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kit.user]);

  if (state.kind === "none") return <>{children}</>;
  if (state.kind === "done") return <ResultScreen award={state.award} mode={mode} accuracy={state.accuracy} />;
  if (state.kind === "failed") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center" data-testid="recovery-failed">
        <p className="font-display text-xl font-extrabold">Couldn&apos;t save your answers yet</p>
        <p className="text-ink-soft">They are kept on this page. Check your connection and try again.</p>
        <ChunkyButton onClick={() => void send(state.pending)}>Try again</ChunkyButton>
      </div>
    );
  }
  return (
    <div className="p-10 text-center font-display font-bold text-ink-soft" aria-live="polite">
      {state.kind === "sending" ? "Saving your answers…" : "Loading…"}
    </div>
  );
}
