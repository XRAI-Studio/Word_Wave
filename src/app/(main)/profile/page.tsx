"use client";

import { useEffect, useState } from "react";
import { Award, BookOpen, Flame, Gem, LogOut, Snowflake, Zap } from "lucide-react";
import { ChangePasswordForm } from "@/components/change-password-form";
import { ChunkyButton } from "@/components/chunky-button";
import type { UserDTO } from "@/lib/types";

function StatTile({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border-b-4 border-line bg-white px-3 py-4 text-center">
      <div className="mx-auto w-fit">{icon}</div>
      <p className="mt-1 font-display text-xl font-extrabold">{value}</p>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserDTO | null>(null);
  const [achievementCount, setAchievementCount] = useState(0);
  const [courseName, setCourseName] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/user")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => {});
    fetch("/api/achievements")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { unlocked: unknown[] }) => setAchievementCount(d.unlocked.length))
      .catch(() => {});
    fetch("/api/courses")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { activeCourseCode: string | null; courses: { code: string; name: string }[] }) =>
        setCourseName(d.courses.find((c) => c.code === d.activeCourseCode)?.name ?? null)
      )
      .catch(() => {});
  }, []);

  async function logout() {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  }

  if (!user) {
    return (
      <div className="mx-auto mt-10 w-full max-w-xl space-y-4 px-4" aria-hidden>
        <div className="h-24 rounded-3xl bg-line/50 motion-safe:animate-pulse" />
        <div className="h-40 rounded-3xl bg-line/50 motion-safe:animate-pulse" />
      </div>
    );
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24">
      <div className="mt-8 flex items-center gap-4">
        <div
          className="flex size-16 items-center justify-center rounded-full bg-brand font-display text-2xl font-extrabold text-white"
          aria-hidden
        >
          {(user.displayName ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold">
            {user.displayName ?? "Learner"}
          </h1>
          {user.email && <p className="truncate text-sm text-ink-soft">{user.email}</p>}
          <p className="text-xs text-ink-soft">
            Learning {courseName ?? "a language"} since {memberSince}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile
          icon={<Zap className="size-6 fill-current text-saffron-deep" aria-hidden />}
          value={user.xp}
          label="Total XP"
        />
        <StatTile
          icon={<Flame className="size-6 fill-current text-flame" aria-hidden />}
          value={user.streakCount}
          label="Day streak"
        />
        <StatTile
          icon={<Gem className="size-6 fill-current text-brand" aria-hidden />}
          value={user.gems}
          label="Gems"
        />
        <StatTile
          icon={<BookOpen className="size-6 text-verde-deep" aria-hidden />}
          value={user.lessonsCompleted}
          label="Lessons done"
        />
        <StatTile
          icon={<Award className="size-6 text-saffron-deep" aria-hidden />}
          value={achievementCount}
          label="Achievements"
        />
        <StatTile
          icon={<Snowflake className="size-6 text-brand" aria-hidden />}
          value={user.streakFreezes}
          label="Streak freezes"
        />
      </div>

      {user.isGuest ? (
        <p className="mt-6 rounded-2xl border-2 border-saffron-deep/40 bg-white px-4 py-3 text-center text-sm font-semibold text-ink-soft">
          Guest session — your progress is deleted when you log out. Create an account to keep
          your progress next time.
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-ink-soft">
          Your progress is saved to this profile — log in on any device to pick up where you left
          off.
        </p>
      )}

      {user.hasPassword && <ChangePasswordForm />}

      <ChunkyButton
        variant="danger"
        onClick={logout}
        disabled={loggingOut}
        className="mt-8 w-full"
      >
        <span className="flex items-center justify-center gap-2">
          <LogOut className="size-4" aria-hidden />
          {loggingOut ? "Logging out…" : "Log out"}
        </span>
      </ChunkyButton>
    </div>
  );
}
