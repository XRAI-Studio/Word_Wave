"use client";

import { use, useEffect, useState } from "react";
import { PendingRecovery } from "@/components/pending-recovery";
import { Quiz } from "@/components/quiz/quiz";
import { SessionPage } from "@/components/session-bar";
import type { ChallengeDTO } from "@/lib/types";
import { apiFetch, RedirectingError } from "@/lib/api-fetch";

interface LessonResponse {
  id: string;
  title: string;
  unitTitle: string;
  courseCode: string;
  labels: { correct: string; celebrate: string };
  challenges: ChallengeDTO[];
}

// A submission kept across a portal sign-in is resolved before the lesson loads. The
// page is its own document (entered and left by full navigations, home-room plan), with
// the Home Room bar above every branch.
export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  return (
    <SessionPage>
      <PendingRecovery mode="lesson">
        <LessonLoader params={params} />
      </PendingRecovery>
    </SessionPage>
  );
}

function LessonLoader({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    apiFetch(`/api/lessons/${lessonId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setLesson)
      .catch((e) => {
        if (!(e instanceof RedirectingError)) setError(true);
      });
  }, [lessonId]);

  if (error) {
    return <p className="p-10 text-center text-ink-soft">This lesson doesn&apos;t exist.</p>;
  }
  if (!lesson) {
    return (
      <div className="p-10 text-center font-display font-bold text-ink-soft" aria-live="polite">
        Loading lesson…
      </div>
    );
  }

  return (
    <Quiz
      challenges={lesson.challenges}
      mode="lesson"
      lessonId={lesson.id}
      labels={lesson.labels}
      courseCode={lesson.courseCode}
    />
  );
}
