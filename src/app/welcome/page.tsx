"use client";

import { useEffect, useState } from "react";
import { HomeRoomButton, useDeparting } from "@/components/home-room";
import { apiFetch, RedirectingError } from "@/lib/api-fetch";
import { selectCourse } from "@/lib/course-select";
import { leaveGuard } from "@/lib/leave-guard";

interface CourseOption {
  code: string;
  name: string;
  emblem: string;
}

// First-run course picker: shown to new users/guests whose activeCourseId is
// null. Choosing a course sets it and enters the app.
export default function WelcomePage() {
  const [courses, setCourses] = useState<CourseOption[] | null>(null);
  const [choosing, setChoosing] = useState<string | null>(null);
  const departing = useDeparting();

  useEffect(() => {
    apiFetch("/api/courses")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { activeCourseCode: string | null; courses: CourseOption[] }) => {
        // Already picked (e.g. back button) — go straight in.
        if (d.activeCourseCode) {
          if (!leaveGuard.isDeparting()) window.location.assign("/learn");
        }
        else setCourses(d.courses);
      })
      // A signed-out learner is already on the way to the portal (apiFetch); any other
      // failure reloads, and the page gate decides again.
      .catch((e) => {
        if (!(e instanceof RedirectingError) && !leaveGuard.isDeparting()) window.location.reload();
      });
  }, []);

  async function choose(code: string) {
    setChoosing(code);
    // Tracked by the leave guard; no /learn navigation once Home Room is leaving.
    if ((await selectCourse(code)) !== "switched") setChoosing(null);
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pt-3">
        <HomeRoomButton />
      </div>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-10">
        <h1 className="font-display text-3xl font-extrabold text-brand">Welcome to WordWave</h1>
        <p className="mt-2 text-ink-soft">Which language do you want to learn?</p>

        <div className="mt-8 space-y-3" aria-busy={!courses}>
          {courses?.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => choose(c.code)}
              disabled={choosing !== null || departing}
              className="flex w-full items-center gap-4 rounded-2xl border-2 border-b-4 border-line bg-white px-4 py-4 text-left font-display font-bold transition-colors hover:border-brand disabled:opacity-60"
            >
              <span className="text-3xl leading-none" aria-hidden>
                {c.emblem}
              </span>
              <span className="flex-1 text-lg">{c.name}</span>
              {choosing === c.code && <span className="text-sm text-ink-soft">Starting…</span>}
            </button>
          ))}
          {!courses && (
            <>
              <div className="h-20 rounded-2xl bg-line/50 motion-safe:animate-pulse" />
              <div className="h-20 rounded-2xl bg-line/50 motion-safe:animate-pulse" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
