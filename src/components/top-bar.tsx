"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Flame, Gem, Zap } from "lucide-react";
import { useGameStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export interface CourseStats {
  levels: number;
  sections: number;
  units: number;
  lessons: number;
}

export interface CourseOption {
  code: string;
  name: string;
  emblem: string;
}

// Duolingo-style course switcher: an emblem button that opens a menu of the
// learner's available courses. Selecting one sets the active course and reloads
// so the whole shell (path, counts, labels) reflects the new course.
function CourseSwitcher({
  activeCourse,
  courses,
}: {
  activeCourse: CourseOption;
  courses: CourseOption[];
}) {
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function pick(code: string) {
    if (code === activeCourse.code) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    try {
      const res = await fetch("/api/course/active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseCode: code }),
      });
      if (res.ok) window.location.assign("/learn");
      else setSwitching(false);
    } catch {
      setSwitching(false);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={switching}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Current course: ${activeCourse.name}. Switch course`}
        className="flex items-center gap-1.5 rounded-xl px-2 py-1 font-display font-bold text-ink hover:bg-line/50"
      >
        <span className="text-xl leading-none" aria-hidden>
          {activeCourse.emblem}
        </span>
        <span className="hidden text-sm sm:inline">{activeCourse.name}</span>
        <ChevronDown className="size-4 text-ink-soft" aria-hidden />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-30 mt-1 w-48 overflow-hidden rounded-2xl border-2 border-line bg-paper shadow-lg"
        >
          <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wide text-ink-soft">
            Courses
          </p>
          {courses.map((c) => (
            <button
              key={c.code}
              type="button"
              role="menuitemradio"
              aria-checked={c.code === activeCourse.code}
              onClick={() => pick(c.code)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left font-display font-bold hover:bg-line/50"
            >
              <span className="text-lg leading-none" aria-hidden>
                {c.emblem}
              </span>
              <span className="flex-1">{c.name}</span>
              {c.code === activeCourse.code && (
                <Check className="size-4 text-brand" aria-hidden />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopBar({
  courseStats,
  activeCourse,
  courses,
}: {
  courseStats: CourseStats;
  activeCourse: CourseOption;
  courses: CourseOption[];
}) {
  const { xp, streak, gems, hydrated, hydrate } = useGameStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-paper/90 backdrop-blur px-4 py-3">
      <div className="flex items-center justify-between">
        <CourseSwitcher activeCourse={activeCourse} courses={courses} />
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
