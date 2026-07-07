"use client";

import { useRouter } from "next/navigation";
import { Award, CheckCircle2, Flame, Gem, Target, Zap } from "lucide-react";
import { ChunkyButton } from "@/components/chunky-button";

export function ResultScreen({
  xpEarned,
  streak,
  accuracy,
  gemsEarned,
  questsCompleted,
  achievementsUnlocked,
}: {
  xpEarned: number;
  streak: number;
  accuracy: number; // 0..1
  gemsEarned: number;
  questsCompleted: { key: string; title: string; gems: number }[];
  achievementsUnlocked: { key: string; title: string; description: string }[];
}) {
  const router = useRouter();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <h1 className="font-display text-3xl font-extrabold text-verde">¡Muy bien!</h1>
      <p className="mt-1 text-ink-soft">Session complete</p>

      <div className="mt-8 grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border-b-4 border-saffron-deep bg-saffron px-3 py-4">
          <Zap className="mx-auto size-6 fill-current text-ink" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold">{xpEarned}</p>
          <p className="text-xs font-bold uppercase tracking-wide">XP earned</p>
        </div>
        <div className="rounded-2xl border-b-4 border-brand bg-brand-soft px-3 py-4">
          <Gem className="mx-auto size-6 fill-current text-brand" aria-hidden />
          <p className="mt-1 font-display text-xl font-extrabold">{gemsEarned}</p>
          <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Gems</p>
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

      {(questsCompleted.length > 0 || achievementsUnlocked.length > 0) && (
        <div className="mt-6 w-full max-w-md space-y-2 text-left">
          {questsCompleted.map((q) => (
            <div
              key={q.key}
              className="flex items-center gap-3 rounded-2xl border-b-4 border-verde bg-verde-soft px-4 py-3"
            >
              <CheckCircle2 className="size-5 shrink-0 text-verde-deep" aria-hidden />
              <span className="flex-1 font-semibold">Quest complete: {q.title}</span>
              <span className="flex items-center gap-1 font-display font-bold text-brand">
                <Gem className="size-4 fill-current" aria-hidden /> +{q.gems}
              </span>
            </div>
          ))}
          {achievementsUnlocked.map((a) => (
            <div
              key={a.key}
              className="flex items-center gap-3 rounded-2xl border-b-4 border-saffron-deep bg-saffron px-4 py-3"
            >
              <Award className="size-5 shrink-0 text-ink" aria-hidden />
              <span className="flex-1 font-semibold">
                {a.title}
                <span className="block text-xs font-normal text-ink/70">{a.description}</span>
              </span>
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
