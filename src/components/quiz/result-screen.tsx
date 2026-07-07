"use client";

import { useRouter } from "next/navigation";
import { Flame, Target, Zap } from "lucide-react";
import { ChunkyButton } from "@/components/chunky-button";

export function ResultScreen({
  xpEarned,
  streak,
  accuracy,
}: {
  xpEarned: number;
  streak: number;
  accuracy: number; // 0..1
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-3xl font-extrabold text-verde">¡Muy bien!</h1>
      <p className="mt-1 text-ink-soft">Session complete</p>

      <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-3">
        <div className="rounded-2xl border-b-4 border-saffron-deep bg-saffron px-3 py-4">
          <Zap className="mx-auto size-6 fill-current text-ink" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold">{xpEarned}</p>
          <p className="text-xs font-bold uppercase tracking-wide">XP earned</p>
        </div>
        <div className="rounded-2xl border-b-4 border-line bg-white px-3 py-4">
          <Flame className="mx-auto size-6 fill-current text-flame" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold">{streak}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Day streak</p>
        </div>
        <div className="rounded-2xl border-b-4 border-line bg-white px-3 py-4">
          <Target className="mx-auto size-6 text-brand" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold">{Math.round(accuracy * 100)}%</p>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Accuracy</p>
        </div>
      </div>

      <ChunkyButton className="mt-10 w-full max-w-md" onClick={() => router.push("/learn")}>
        Back to the path
      </ChunkyButton>
    </div>
  );
}
