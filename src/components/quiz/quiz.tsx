"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ChunkyButton } from "@/components/chunky-button";
import { useDeparting, useGuardedLeave } from "@/components/home-room";
import { FillBlank } from "@/components/quiz/fill-blank";
import { MatchPairs } from "@/components/quiz/match-pairs";
import { MultipleChoice } from "@/components/quiz/multiple-choice";
import { ResultScreen } from "@/components/quiz/result-screen";
import { Translate } from "@/components/quiz/translate";
import { useKit } from "@/components/kit-provider";
import { RedirectingError } from "@/lib/api-fetch";
import type { AwardOutcome } from "@/lib/completion";
import { clearPendingFor, keepPending, type PendingSubmission } from "@/lib/pending-submission";
import { reloadForAccountChange } from "@/lib/account-change";
import { leaveGuard } from "@/lib/leave-guard";
import { CompletionError, hudTotalsAfter, postCompletion } from "@/lib/submit-completion";
import { useGameStore } from "@/lib/store";
import { normalizeTyped } from "@/lib/course-policy";
import type { ChallengeDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type Status = "answering" | "correct" | "wrong" | "submitting" | "done";

/** Shown when the session expired while saving and the browser is off to sign in again. */
export const SIGN_IN_AGAIN = "Signing you in again… If nothing happens, press Check again.";
/** How long a sign-in departure may take before the quiz is usable again. */
const SIGN_IN_RESET_MS = 3000;

// Orchestrates a quiz session. Lesson mode marks the lesson complete;
// review mode feeds the SRS directly.
export function Quiz({
  challenges,
  mode,
  lessonId,
  labels = { correct: "¡Correcto!", celebrate: "¡Muy bien!" },
  courseCode,
}: {
  challenges: ChallengeDTO[];
  mode: "lesson" | "review";
  lessonId?: string;
  labels?: { correct: string; celebrate: string };
  /** Selects the typed-answer policy (diacritic + j/v handling). Falls back to
   *  Spanish, matching the default labels above. */
  courseCode?: string;
}) {
  const kit = useKit();
  const leave = useGuardedLeave();
  const departing = useDeparting();
  const hydrate = useGameStore((st) => st.hydrate);

  const [queue, setQueue] = useState(challenges);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<Status>("answering");
  const [mcValue, setMcValue] = useState<string | null>(null);
  const [trValue, setTrValue] = useState<number[]>([]);
  const [fbValue, setFbValue] = useState("");
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [outcome, setOutcome] = useState<{ award: AwardOutcome; accuracy: number } | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // wordId -> true only if never missed this session; challengeId -> first try correct
  // One id per quiz, kept across retries and the sign-in round trip, so the server
  // applies this quiz's answers at most once (WW-P5-R3-001).
  const [submissionId] = useState(() => crypto.randomUUID());
  const wordResults = useRef(new Map<string, boolean>());
  const firstTry = useRef(new Map<string, boolean>());

  const current = queue[idx];

  // Unsaved work (home-room plan): at least one answer given and not yet confirmed saved
  // by the server. Refs, written where the answer or the save happens, so the leave guard
  // reads the truth at once (a Home Room press re-checks right after a save settles).
  const answeredRef = useRef(false);
  const savedRef = useRef(false);
  // The finished quiz last handed to `submit`, so "Leave without saving" can drop the
  // copy kept for a resend (WW-P5-R6-002).
  const sentRef = useRef<PendingSubmission | null>(null);
  useEffect(
    () =>
      leaveGuard.register({
        kind: mode,
        hasUnsavedWork: () => answeredRef.current && !savedRef.current,
        discard: () => {
          if (sentRef.current) clearPendingFor(window.sessionStorage, sentRef.current);
        },
      }),
    [mode]
  );
  const resetTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => {
    const timer = resetTimer;
    return () => clearTimeout(timer.current);
  }, []);

  function markAnswered() {
    if (answeredRef.current) return;
    answeredRef.current = true;
    leaveGuard.refresh();
  }

  function recordWords(wordIds: string[], correct: boolean) {
    for (const id of wordIds) {
      wordResults.current.set(id, (wordResults.current.get(id) ?? true) && correct);
    }
    markAnswered();
  }

  function recordFirstTry(challengeId: string, correct: boolean) {
    if (!firstTry.current.has(challengeId)) firstTry.current.set(challengeId, correct);
    markAnswered();
  }

  function handleCorrect() {
    recordWords(current.meta.wordIds, true);
    recordFirstTry(current.id, true);
    setSolved((s) => new Set(s).add(current.id));
    setStatus("correct");
  }

  function handleWrong() {
    recordWords(current.meta.wordIds, false);
    recordFirstTry(current.id, false);
    setMistakes((m) => m + 1);
    setQueue((q) => [...q, current]); // Duolingo-style: missed cards come back
    setStatus("wrong");
  }

  function check() {
    if (current.type === "MULTIPLE_CHOICE") {
      if (mcValue === current.correctAnswer) handleCorrect();
      else handleWrong();
    } else if (current.type === "TRANSLATE") {
      const built = trValue
        .map((i) => current.meta.wordBank[i])
        .join(" ")
        .toLowerCase()
        .trim();
      if (built === current.correctAnswer.toLowerCase().trim()) handleCorrect();
      else handleWrong();
    } else if (current.type === "FILL_BLANK") {
      // Accept the expected answer with any parenthetical qualifier dropped
      // ("I am (feeling)" accepts "i am").
      const expected = [
        current.correctAnswer,
        current.correctAnswer.replace(/\([^)]*\)/g, ""),
      ].map((answer) => normalizeTyped(answer, courseCode));
      if (expected.includes(normalizeTyped(fbValue, courseCode))) handleCorrect();
      else handleWrong();
    }
  }

  async function submit(p: PendingSubmission) {
    clearTimeout(resetTimer.current);
    setStatus("submitting");
    // Kept before the first send, until it is answered (WW-P5-R5-003): a reload while it
    // is in flight, polling or failed finds it, and PendingRecovery sends it again under
    // the same submission id, which recovers the outcome instead of losing the quiz.
    // Another quiz's kept submission is never overwritten (WW-P5-R6-001).
    sentRef.current = p;
    keepPending(window.sessionStorage, p);
    try {
      const data = await postCompletion(p);
      clearPendingFor(window.sessionStorage, p);
      savedRef.current = true;
      leaveGuard.refresh();
      setSigningIn(false);
      // A repeat carries the first send's historical totals; it brings the current ones.
      const totals = hudTotalsAfter(data);
      if (totals) hydrate(totals);
      setOutcome({ award: data.award, accuracy: p.accuracy });
      setStatus("done");
    } catch (err) {
      // Session expired: postCompletion kept the answers and the browser is leaving for
      // the portal; PendingRecovery sends them when this route loads again. If that
      // departure does not happen (the learner stayed at the browser's leave prompt,
      // shown when the answers could not be kept), the quiz becomes retryable.
      if (err instanceof RedirectingError) {
        setSigningIn(true);
        resetTimer.current = setTimeout(() => {
          leaveGuard.resume();
          setStatus("correct");
        }, SIGN_IN_RESET_MS);
        return;
      }
      // Someone else is signed in now: these answers are not theirs (WW-P5-R3-002).
      if (err instanceof CompletionError && err.code === "user-mismatch") {
        clearPendingFor(window.sessionStorage, p);
        reloadForAccountChange();
        return;
      }
      setSigningIn(false);
      toast.error("Couldn't save your progress. Check your connection and try again.");
      setStatus("correct"); // let the user hit Continue and retry
    }
  }

  function finish() {
    const entries = [...wordResults.current.entries()];
    const attempts = [...firstTry.current.values()];
    const accuracy = attempts.length ? attempts.filter(Boolean).length / attempts.length : 1;
    // Tracked, so a clean "Return to Home Room" waits for the save (at most 2 s).
    void leaveGuard.track(submit({
      path: window.location.pathname,
      url: mode === "lesson" ? `/api/lessons/${lessonId}/complete` : "/api/review/complete",
      body:
        mode === "lesson"
          ? {
              failedWordIds: entries.filter(([, ok]) => !ok).map(([id]) => id),
              correctWordIds: entries.filter(([, ok]) => ok).map(([id]) => id),
              mistakes,
              submissionId,
            }
          : { results: entries.map(([wordId, correct]) => ({ wordId, correct })), submissionId },
      userId: kit.user?.id ?? "",
      courseCode: courseCode ?? "",
      accuracy,
    }));
  }

  function advance() {
    if (idx + 1 >= queue.length) {
      finish();
      return;
    }
    setIdx(idx + 1);
    setMcValue(null);
    setTrValue([]);
    setFbValue("");
    setStatus("answering");
  }

  if (status === "done" && outcome) {
    return (
      <ResultScreen
        award={outcome.award}
        mode={mode}
        accuracy={outcome.accuracy}
        celebrateLabel={labels.celebrate}
      />
    );
  }

  if (!current) return null;

  const canCheck =
    current.type === "MULTIPLE_CHOICE"
      ? mcValue !== null
      : current.type === "FILL_BLANK"
        ? fbValue.trim().length > 0
        : trValue.length > 0;
  const progress = (solved.size / challenges.length) * 100;

  return (
    <div className="flex flex-1 flex-col">
      {leave.dialog}
      {/* header */}
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-4">
        <button
          type="button"
          onClick={(e) => void leave.request(mode === "lesson" ? "/learn" : "/review", e.currentTarget)}
          aria-label="Quit session"
          aria-disabled={leave.busy || undefined}
          className="rounded text-ink-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          <X className="size-6" />
        </button>
        <div
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-4 flex-1 overflow-hidden rounded-full bg-line"
        >
          <div
            className="h-full rounded-full bg-verde transition-[width] duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* While Home Room or the X is leaving, the quiz holds still (Codex WW-HR-001). */}
      <fieldset disabled={departing} className="m-0 flex min-w-0 flex-1 flex-col border-0 p-0">
        {/* challenge */}
        <div className="mx-auto w-full max-w-2xl flex-1 px-4 pb-40 pt-6">
          <h1 className="font-display text-2xl font-extrabold">{current.prompt}</h1>
          <div className="mt-8">
            {current.type === "MULTIPLE_CHOICE" && (
              <MultipleChoice
                meta={current.meta}
                value={mcValue}
                onChange={setMcValue}
                disabled={status !== "answering"}
              />
            )}
            {current.type === "TRANSLATE" && (
              <Translate
                meta={current.meta}
                value={trValue}
                onChange={setTrValue}
                disabled={status !== "answering"}
              />
            )}
            {current.type === "FILL_BLANK" && (
              <FillBlank
                key={`${current.id}-${idx}`}
                value={fbValue}
                onChange={setFbValue}
                onSubmit={() => {
                  if (status === "answering" && fbValue.trim().length > 0) check();
                }}
                disabled={status !== "answering"}
              />
            )}
            {current.type === "MATCH" && (
              <MatchPairs
                key={`${current.id}-${idx}`}
                meta={current.meta}
                onMiss={(ids) => recordWords(ids, false)}
                onComplete={handleCorrect}
              />
            )}
          </div>
        </div>

        {/* footer */}
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 border-t-2",
            status === "correct" || status === "submitting"
              ? "border-verde bg-verde-soft"
              : status === "wrong"
                ? "border-heart bg-heart-soft"
                : "border-line bg-surface"
          )}
        >
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4">
            <div aria-live="polite" className="font-display font-bold">
              {signingIn && (status === "correct" || status === "submitting") ? (
                <span className="text-ink" data-testid="sign-in-again">
                  {SIGN_IN_AGAIN}
                </span>
              ) : (
                (status === "correct" || status === "submitting") && (
                  <span className="text-verde-ink">{labels.correct}</span>
                )
              )}
              {status === "wrong" && (
                <span className="text-heart-ink">
                  Correct answer: <span className="font-sans font-semibold">{current.correctAnswer}</span>
                </span>
              )}
            </div>
            {current.type === "MATCH" && status === "answering" ? (
              <span className="text-ink-soft">Match all the pairs to continue</span>
            ) : status === "answering" ? (
              <ChunkyButton onClick={check} disabled={!canCheck} className="min-w-36">
                Check
              </ChunkyButton>
            ) : (
              <ChunkyButton
                variant={status === "wrong" ? "danger" : "success"}
                onClick={advance}
                disabled={status === "submitting"}
                className="min-w-36"
              >
                {status === "submitting" ? "Saving…" : signingIn ? "Check" : "Continue"}
              </ChunkyButton>
            )}
          </div>
        </div>
      </fieldset>
    </div>
  );
}
