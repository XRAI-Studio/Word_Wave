"use client";

import { useEffect, useState } from "react";
import { PendingRecovery } from "@/components/pending-recovery";
import { Quiz } from "@/components/quiz/quiz";
import { SessionPage } from "@/components/session-bar";
import type { ChallengeDTO } from "@/lib/types";
import { apiFetch, RedirectingError } from "@/lib/api-fetch";

type Labels = { correct: string; celebrate: string };
const DEFAULT_LABELS: Labels = { correct: "¡Correcto!", celebrate: "¡Muy bien!" };

// A submission kept across a portal sign-in is resolved before the review loads. The
// page is its own document (entered and left by full navigations, home-room plan), with
// the Home Room bar above every branch.
export default function ReviewSessionPage() {
  return (
    <SessionPage>
      <PendingRecovery mode="review">
        <ReviewLoader />
      </PendingRecovery>
    </SessionPage>
  );
}

function ReviewLoader() {
  const [challenges, setChallenges] = useState<ChallengeDTO[] | null>(null);
  const [labels, setLabels] = useState<Labels>(DEFAULT_LABELS);
  const [courseCode, setCourseCode] = useState<string | undefined>();

  useEffect(() => {
    apiFetch("/api/review")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setChallenges(d.challenges);
        if (d.labels) setLabels(d.labels);
        if (d.courseCode) setCourseCode(d.courseCode);
      })
      .catch((e) => {
        if (!(e instanceof RedirectingError)) setChallenges([]);
      });
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
        <button
          type="button"
          onClick={() => window.location.assign("/learn")}
          className="mt-6 inline-block rounded font-bold text-brand-ink underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          Back to the path
        </button>
      </div>
    );
  }

  return <Quiz challenges={challenges} mode="review" labels={labels} courseCode={courseCode} />;
}
