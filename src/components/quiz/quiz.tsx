"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ChunkyButton } from "@/components/chunky-button";
import { FillBlank } from "@/components/quiz/fill-blank";
import { MatchPairs } from "@/components/quiz/match-pairs";
import { MultipleChoice } from "@/components/quiz/multiple-choice";
import { ResultScreen } from "@/components/quiz/result-screen";
import { Translate } from "@/components/quiz/translate";
import { useGameStore } from "@/lib/store";
import type { ChallengeDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

type Status = "answering" | "correct" | "wrong" | "submitting" | "done";

// Forgiving comparison for typed answers: case-, accent-, and
// punctuation-insensitive ("como estas" matches "¿cómo estás?").
function normalizeTyped(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ\s]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface Rewards {
  xpEarned: number;
  xp: number;
  streakCount: number;
  gems: number;
  gemsEarned: number;
  questsCompleted: { key: string; title: string; gems: number }[];
  achievementsUnlocked: { key: string; title: string; description: string }[];
}

// Orchestrates a quiz session. Lesson mode marks the lesson complete;
// review mode feeds the SRS directly.
export function Quiz({
  challenges,
  mode,
  lessonId,
}: {
  challenges: ChallengeDTO[];
  mode: "lesson" | "review";
  lessonId?: string;
}) {
  const router = useRouter();
  const { hydrate, applyRewards } = useGameStore();

  const [queue, setQueue] = useState(challenges);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<Status>("answering");
  const [mcValue, setMcValue] = useState<string | null>(null);
  const [trValue, setTrValue] = useState<number[]>([]);
  const [fbValue, setFbValue] = useState("");
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = useState(0);
  const [rewards, setRewards] = useState<(Rewards & { accuracy: number }) | null>(null);

  // wordId -> true only if never missed this session; challengeId -> first try correct
  const wordResults = useRef(new Map<string, boolean>());
  const firstTry = useRef(new Map<string, boolean>());

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const current = queue[idx];

  function recordWords(wordIds: string[], correct: boolean) {
    for (const id of wordIds) {
      wordResults.current.set(id, (wordResults.current.get(id) ?? true) && correct);
    }
  }

  function recordFirstTry(challengeId: string, correct: boolean) {
    if (!firstTry.current.has(challengeId)) firstTry.current.set(challengeId, correct);
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
      ].map(normalizeTyped);
      if (expected.includes(normalizeTyped(fbValue))) handleCorrect();
      else handleWrong();
    }
  }

  async function finish() {
    setStatus("submitting");
    const entries = [...wordResults.current.entries()];
    try {
      const res =
        mode === "lesson"
          ? await fetch(`/api/lessons/${lessonId}/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                failedWordIds: entries.filter(([, ok]) => !ok).map(([id]) => id),
                correctWordIds: entries.filter(([, ok]) => ok).map(([id]) => id),
                mistakes,
              }),
            })
          : await fetch("/api/review/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                results: entries.map(([wordId, correct]) => ({ wordId, correct })),
              }),
            });
      if (!res.ok) throw new Error(String(res.status));
      const data: Rewards = await res.json();
      applyRewards({
        xp: data.xp,
        streakCount: data.streakCount,
        gems: data.gems,
      });
      const attempts = [...firstTry.current.values()];
      const accuracy = attempts.length
        ? attempts.filter(Boolean).length / attempts.length
        : 1;
      setRewards({ ...data, accuracy });
      setStatus("done");
    } catch {
      toast.error("Couldn't save your progress — check the app is running locally.");
      setStatus("correct"); // let the user hit Continue and retry
    }
  }

  function advance() {
    if (idx + 1 >= queue.length) {
      void finish();
      return;
    }
    setIdx(idx + 1);
    setMcValue(null);
    setTrValue([]);
    setFbValue("");
    setStatus("answering");
  }

  if (status === "done" && rewards) {
    return (
      <ResultScreen
        xpEarned={rewards.xpEarned}
        streak={rewards.streakCount}
        accuracy={rewards.accuracy}
        gemsEarned={rewards.gemsEarned}
        questsCompleted={rewards.questsCompleted}
        achievementsUnlocked={rewards.achievementsUnlocked}
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
    <div className="flex min-h-dvh flex-col">
      {/* header */}
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-4 py-4">
        <button
          onClick={() => router.push(mode === "lesson" ? "/learn" : "/review")}
          aria-label="Quit session"
          className="text-ink-soft hover:text-ink"
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
              : "border-line bg-white"
        )}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-4 px-4 py-4">
          <div aria-live="polite" className="font-display font-bold">
            {(status === "correct" || status === "submitting") && (
              <span className="text-verde-deep">¡Correcto!</span>
            )}
            {status === "wrong" && (
              <span className="text-heart-deep">
                Correct answer: <span className="font-sans font-semibold">{current.correctAnswer}</span>
              </span>
            )}
          </div>
          {current.type === "MATCH" && status === "answering" ? (
            <span className="text-ink-soft text-sm">Match all the pairs to continue</span>
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
              {status === "submitting" ? "Saving…" : "Continue"}
            </ChunkyButton>
          )}
        </div>
      </div>
    </div>
  );
}
