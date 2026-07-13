"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Flame, Gem, Zap } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface CourseStats {
  levels: number;
  sections: number;
  units: number;
  lessons: number;
}

export function TopBar({ courseStats }: { courseStats: CourseStats }) {
  const { xp, streak, gems, hydrated, hydrate } = useGameStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/learn" className="sm:invisible font-display text-xl font-extrabold text-brand">
          LingoDuo
        </Link>
        <div
          className={cn(
            "flex items-center gap-5 font-display font-bold transition-opacity",
            hydrated ? "opacity-100" : "opacity-0"
          )}
        >
          <span className="flex items-center gap-1.5 text-brand" title="Gems">
            <Gem className="size-5 fill-current" aria-hidden />
            {gems}
            <span className="sr-only">gems</span>
          </span>
          <span className="flex items-center gap-1.5 text-flame" title="Day streak">
            <Flame className="size-5 fill-current" aria-hidden />
            {streak}
            <span className="sr-only">day streak</span>
          </span>
          <span className="flex items-center gap-1.5 text-saffron-deep" title="Total XP">
            <Zap className="size-5 fill-current" aria-hidden />
            {xp}
            <span className="sr-only">total XP</span>
          </span>
        </div>
      </div>
      <p className="mt-1 text-center text-xs font-semibold text-ink-soft">
        {courseStats.levels} levels · {courseStats.sections} sections · {courseStats.units} units ·{" "}
        {courseStats.lessons} lessons
      </p>
    </header>
  );
}
