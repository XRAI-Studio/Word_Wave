"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Quiz } from "@/components/quiz/quiz";
import type { ChallengeDTO } from "@/lib/types";

type Labels = { correct: string; celebrate: string };
const DEFAULT_LABELS: Labels = { correct: "¡Correcto!", celebrate: "¡Muy bien!" };

export default function ReviewSessionPage() {
  const [challenges, setChallenges] = useState<ChallengeDTO[] | null>(null);
  const [labels, setLabels] = useState<Labels>(DEFAULT_LABELS);

  useEffect(() => {
    fetch("/api/review")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setChallenges(d.challenges);
        if (d.labels) setLabels(d.labels);
      })
      .catch(() => setChallenges([]));
  }, []);

  if (!challenges) {
    return (
      <div className="p-10 text-center font-display font-bold text-ink-soft" aria-live="polite">
        Building your review…
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="p-10 text-center">
        <p className="font-display text-xl font-extrabold">Nothing to review right now</p>
        <p className="mt-2 text-ink-soft">
          Words you miss in lessons will show up here when they&apos;re due.
        </p>
        <Link href="/learn" className="mt-6 inline-block font-bold text-brand underline">
          Back to the path
        </Link>
      </div>
    );
  }

  return <Quiz challenges={challenges} mode="review" labels={labels} />;
}
