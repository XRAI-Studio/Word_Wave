"use client";

import { useCallback, useEffect, useState } from "react";
import { Award, Gem, Lock, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { ChunkyButton } from "@/components/chunky-button";
import { STREAK_FREEZE_COST, MAX_STREAK_FREEZES } from "@/lib/gamification";
import { ACHIEVEMENTS } from "@/lib/rewards-defs";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AwardsPage() {
  const { gems, streakFreezes, hydrate } = useGameStore();
  const [unlocked, setUnlocked] = useState<Set<string> | null>(null);
  const [buying, setBuying] = useState(false);

  const load = useCallback(() => {
    fetch("/api/achievements")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { unlocked: { key: string }[] }) =>
        setUnlocked(new Set(d.unlocked.map((u) => u.key)))
      )
      .catch(() => setUnlocked(new Set()));
  }, []);

  useEffect(() => {
    hydrate();
    load();
  }, [hydrate, load]);

  async function buyFreeze() {
    setBuying(true);
    try {
      const res = await fetch("/api/shop/streak-freeze", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Couldn't buy a streak freeze.");
        return;
      }
      toast.success("Streak freeze equipped — one missed day is covered.");
      await hydrate();
      load(); // the Safety Net achievement may have unlocked
    } catch {
      toast.error("Couldn't reach the shop — is the app running?");
    } finally {
      setBuying(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24">
      <h1 className="mt-8 font-display text-2xl font-extrabold">Awards</h1>

      {/* streak freeze shop */}
      <section className="mt-6 flex items-center gap-4 rounded-3xl border-2 border-line bg-white p-5">
        <Snowflake className="size-10 shrink-0 text-brand" aria-hidden />
        <div className="flex-1">
          <h2 className="font-display font-extrabold">Streak Freeze</h2>
          <p className="text-sm text-ink-soft">
            Covers one missed day so your streak survives. Holding {streakFreezes}/
            {MAX_STREAK_FREEZES}.
          </p>
        </div>
        <ChunkyButton
          onClick={buyFreeze}
          disabled={buying || streakFreezes >= MAX_STREAK_FREEZES || gems < STREAK_FREEZE_COST}
          className="shrink-0"
        >
          <span className="flex items-center gap-1.5">
            <Gem className="size-4 fill-current" aria-hidden /> {STREAK_FREEZE_COST}
          </span>
        </ChunkyButton>
      </section>

      {/* achievements */}
      <section className="mt-8">
        <h2 className="font-display text-lg font-extrabold">Achievements</h2>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((a) => {
            const got = unlocked?.has(a.key) ?? false;
            return (
              <div
                key={a.key}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-b-4 px-4 py-3",
                  got ? "border-saffron-deep bg-saffron" : "border-line bg-white opacity-70"
                )}
              >
                {got ? (
                  <Award className="size-6 shrink-0 text-ink" aria-hidden />
                ) : (
                  <Lock className="size-6 shrink-0 text-ink-soft" aria-hidden />
                )}
                <div>
                  <p className="font-display font-extrabold">{a.title}</p>
                  <p className={cn("text-xs", got ? "text-ink/70" : "text-ink-soft")}>
                    {a.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
