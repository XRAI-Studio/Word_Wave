"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ScrollText } from "lucide-react";
import type { QuestDTO } from "@/lib/types";
import { cn } from "@/lib/utils";

// Today's three daily quests with progress bars.
export function QuestsCard() {
  const [quests, setQuests] = useState<QuestDTO[] | null>(null);

  useEffect(() => {
    fetch("/api/quests")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { quests: QuestDTO[] }) => setQuests(d.quests))
      .catch(() => {});
  }, []);

  if (!quests) return null;

  return (
    <section className="mt-8 rounded-3xl border-2 border-line bg-white p-5">
      <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">
        <ScrollText className="size-5 text-saffron-deep" aria-hidden />
        Daily quests
      </h2>
      <ul className="mt-4 space-y-4">
        {quests.map((q) => {
          const pct = Math.min(100, (q.progress / q.target) * 100);
          return (
            <li key={q.key}>
              <div className="flex items-center justify-between gap-2 text-sm font-semibold">
                <span className={cn(q.completed && "text-verde-deep")}>{q.title}</span>
                {q.completed ? (
                  <CheckCircle2 className="size-4 text-verde-deep" aria-label="completed" />
                ) : (
                  <span className="text-ink-soft">
                    {q.progress}/{q.target}
                  </span>
                )}
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(pct)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={q.title}
                className="mt-1.5 h-3 overflow-hidden rounded-full bg-line"
              >
                <div
                  className={cn("h-full rounded-full", q.completed ? "bg-verde" : "bg-saffron-deep")}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
