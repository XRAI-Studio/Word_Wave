"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpenCheck } from "lucide-react";
import { ChunkyButton } from "@/components/chunky-button";

export default function ReviewPage() {
  const [dueCount, setDueCount] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/review")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setDueCount(d.dueCount))
      .catch(() => setDueCount(0));
  }, []);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-12">
      <div className="rounded-3xl border border-line bg-white p-8 text-center">
        <BookOpenCheck className="mx-auto size-12 text-brand" aria-hidden />
        <h1 className="mt-4 font-display text-2xl font-extrabold">Review</h1>
        <p className="mt-2 text-ink-soft">
          Words you missed come back here on a spaced schedule — get them right and they
          wait longer before returning.
        </p>

        <p className="mt-6 font-display text-lg font-bold" aria-live="polite">
          {dueCount === null
            ? "Checking your words…"
            : dueCount === 0
              ? "Nothing due right now. Miss a word in a lesson and it lands here."
              : `${dueCount} word${dueCount === 1 ? "" : "s"} due for review`}
        </p>

        <ChunkyButton
          className="mt-6 w-full"
          disabled={!dueCount}
          onClick={() => router.push("/review/session")}
        >
          Start review
        </ChunkyButton>
      </div>
    </div>
  );
}
