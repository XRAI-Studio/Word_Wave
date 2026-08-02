"use client";

import { use, useEffect, useState } from "react";
import { Quiz } from "@/components/quiz/quiz";
import type { ChallengeDTO } from "@/lib/types";

interface LessonResponse {
  id: string;
  title: string;
  unitTitle: string;
  courseCode: string;
  labels: { correct: string; celebrate: string };
  challenges: ChallengeDTO[];
}

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const [lesson, setLesson] = useState<LessonResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/lessons/${lessonId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setLesson)
      .catch(() => setError(true));
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
