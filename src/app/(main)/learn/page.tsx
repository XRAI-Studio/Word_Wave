"use client";

import { useEffect, useState } from "react";
import { LessonPath, type UnitData } from "@/components/learn/lesson-path";
import { QuestsCard } from "@/components/quests-card";

interface SectionData {
  id: string;
  title: string;
  description: string;
  units: UnitData[];
}

interface UnitsResponse {
  activeLessonId: string | null;
  sections: SectionData[];
}

export default function LearnPage() {
  const [data, setData] = useState<UnitsResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/units")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setData)
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <p className="p-10 text-center text-ink-soft">
        Couldn&apos;t load the course. Check that the database is seeded, then reload.
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24">
      <QuestsCard />
      {data ? (
        data.sections.map((section, si) => (
          <section key={section.id} className="mt-10">
            <header className="flex items-center gap-4">
              <div className="h-0.5 flex-1 bg-line" aria-hidden />
              <div className="text-center">
                <p className="font-display text-xs font-extrabold uppercase tracking-[0.2em] text-ink-soft">
                  Section {si + 1}
                </p>
                <h2 className="font-display text-xl font-extrabold text-ink">
                  {section.title.replace(/^Section \d+: /, "")}
                </h2>
                <p className="text-sm text-ink-soft">{section.description}</p>
              </div>
              <div className="h-0.5 flex-1 bg-line" aria-hidden />
            </header>

            {section.units.map((unit, ui) => (
              <LessonPath
                key={unit.id}
                unit={unit}
                unitNumber={ui + 1}
                activeLessonId={data.activeLessonId}
              />
            ))}
          </section>
        ))
      ) : (
        <div className="mt-10 space-y-4" aria-hidden>
          <div className="h-24 rounded-3xl bg-line/50 motion-safe:animate-pulse" />
          <div className="mx-auto h-16 w-16 rounded-full bg-line/50 motion-safe:animate-pulse" />
          <div className="mx-auto h-16 w-16 rounded-full bg-line/50 motion-safe:animate-pulse" />
        </div>
      )}
    </div>
  );
}
