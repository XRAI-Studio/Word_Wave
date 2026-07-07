"use client";

import { useRouter } from "next/navigation";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UnitData {
  id: string;
  title: string;
  description: string;
  lessons: { id: string; title: string; completed: boolean }[];
}

// Snaking horizontal offsets, repeating like a footpath. Direction flips per
// unit so consecutive units bend opposite ways.
const WEAVE = [0, 1, 2, 1];

export function LessonPath({
  unit,
  unitNumber,
  activeLessonId,
}: {
  unit: UnitData;
  unitNumber: number;
  activeLessonId: string | null;
}) {
  const router = useRouter();

  return (
    <section className="mt-8">
      <div className="rounded-3xl bg-brand text-white px-6 py-5 border-b-4 border-brand-deep">
        <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-white/70">
          Unit {unitNumber}
        </p>
        <h3 className="font-display text-xl font-extrabold">{unit.title}</h3>
        <p className="text-white/85 text-sm">{unit.description}</p>
      </div>

      <ol className="mt-12 flex flex-col items-center gap-12">
        {unit.lessons.map((lesson, i) => {
          // Every lesson is playable; "active" is just the suggested next one.
          const state = lesson.completed
            ? "done"
            : lesson.id === activeLessonId
              ? "active"
              : "open";
          const offset = WEAVE[i % WEAVE.length] * 44 * (unitNumber % 2 === 0 ? -1 : 1);

          return (
            <li key={lesson.id} style={{ transform: `translateX(${offset}px)` }}>
              <div className="relative flex flex-col items-center">
                {state === "active" && (
                  <span
                    className="absolute -top-9 rounded-xl border border-line bg-white px-3 py-1 font-display text-xs font-extrabold uppercase tracking-widest text-brand shadow-sm motion-safe:animate-bounce"
                    aria-hidden
                  >
                    Start
                  </span>
                )}
                <button
                  onClick={() => router.push(`/lesson/${lesson.id}`)}
                  aria-label={`${lesson.title} — ${
                    state === "done" ? "completed, practice again" : state === "active" ? "start lesson" : "jump ahead"
                  }`}
                  className={cn(
                    "flex size-16 items-center justify-center rounded-full border-b-8 transition-transform hover:scale-105",
                    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
                    state === "done" && "bg-saffron border-saffron-deep text-ink",
                    state === "active" && "bg-brand border-brand-deep text-white",
                    state === "open" && "bg-white border-line text-brand"
                  )}
                >
                  {state === "done" ? (
                    <Check className="size-7" strokeWidth={3} />
                  ) : (
                    <Star className={cn("size-7", state === "active" && "fill-current")} />
                  )}
                </button>
                <span className="mt-2 font-display text-sm font-bold text-ink-soft">
                  {lesson.title}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
