"use client";

import { useRouter } from "next/navigation";
import { Award, Flame, Gem, Target, Zap } from "lucide-react";
import { ChunkyButton } from "@/components/chunky-button";
import type { AwardOutcome } from "@/lib/completion";
import { useGameStore } from "@/lib/store";

/** The line under the XP tile for each award status (work order criterion 21). */
export function awardMessage(award: AwardOutcome, mode: "lesson" | "review"): string | null {
  switch (award.status) {
    case "awarded":
      return `+${award.result?.awarded_xp ?? 0} XP`;
    case "capped":
      return "Daily XP limit reached";
    case "failed":
      return "Progress saved; XP could not be recorded";
    case "skipped":
      return mode === "lesson" ? "Already completed: no new XP" : null;
  }
}

export function ResultScreen({
  award,
  mode,
  accuracy,
  celebrateLabel = "¡Muy bien!",
}: {
  award: AwardOutcome;
  mode: "lesson" | "review";
  accuracy: number; // 0..1
  celebrateLabel?: string;
}) {
  const router = useRouter();
  const totals = award.result;
  // Gems and streak are the learner's current ones (the HUD's), not the award's snapshot,
  // which for a repeated submission is historical (WW-P5-R4-002).
  const { gems, streak, hydrated } = useGameStore();
  const message = awardMessage(award, mode);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="font-display text-3xl font-extrabold text-verde">{celebrateLabel}</h1>
      <p className="mt-1 text-ink-soft">Session complete</p>

      <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border-b-4 border-saffron-deep bg-saffron px-3 py-4">
          <Zap className="mx-auto size-6 fill-current text-ink" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold" data-testid="xp-earned">
            {totals?.awarded_xp ?? 0}
          </p>
          <p className="text-xs font-bold uppercase tracking-wide">XP earned</p>
        </div>
        <div className="rounded-2xl border-b-4 border-brand bg-brand-soft px-3 py-4">
          <Gem className="mx-auto size-6 fill-current text-brand" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold">{hydrated ? gems : "–"}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Gems</p>
        </div>
        <div className="rounded-2xl border-b-4 border-line bg-white px-3 py-4">
          <Flame className="mx-auto size-6 fill-current text-flame" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold">{hydrated ? streak : "–"}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Day streak</p>
        </div>
        <div className="rounded-2xl border-b-4 border-line bg-white px-3 py-4">
          <Target className="mx-auto size-6 text-brand" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold">{Math.round(accuracy * 100)}%</p>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Accuracy</p>
        </div>
      </div>

      {message && (
        <p className="mt-6 font-display font-bold text-ink-soft" data-testid="award-message" data-status={award.status}>
          {message}
        </p>
      )}

      {totals && totals.new_achievements.length > 0 && (
        <div className="mt-4 w-full max-w-md space-y-2 text-left">
          {totals.new_achievements.map((id) => (
            <div
              key={id}
              className="flex items-center gap-3 rounded-2xl border-b-4 border-saffron-deep bg-saffron px-4 py-3"
            >
              <Award className="size-5 shrink-0 text-ink" aria-hidden />
              <span className="flex-1 font-semibold">Achievement unlocked</span>
            </div>
          ))}
        </div>
      )}

      <ChunkyButton className="mt-10 w-full max-w-md" onClick={() => router.push("/learn")}>
        Back to the path
      </ChunkyButton>
    </div>
  );
}
