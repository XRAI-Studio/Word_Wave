"use client";

import { useEffect, useState } from "react";
import { BookOpen, ExternalLink, Flame, Gem, Zap } from "lucide-react";
import { useKit } from "@/components/kit-provider";
import { apiFetch, PORTAL } from "@/lib/api-fetch";
import { useGameStore } from "@/lib/store";
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

// The learner's account belongs to the school portal: sign-in, password, XP, streak and
// gems are all there. This page shows Word Wave's part and links to the rest.
export default function ProfilePage() {
  const kit = useKit();
  const { xp, streak, gems } = useGameStore();
  const [user, setUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    apiFetch("/api/user")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => {});
  }, []);

  const name = user?.displayName ?? kit.user?.displayName ?? "Learner";
  const memberSince = user
    ? new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" })
    : null;

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-24">
      <div className="mt-8 flex items-center gap-4">
        <div
          className="flex size-16 items-center justify-center rounded-full bg-brand font-display text-2xl font-extrabold text-white"
          aria-hidden
        >
          {name.slice(0, 1).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold">{name}</h1>
          {memberSince && (
            <p className="text-xs text-ink-soft">
              Learning {user?.activeCourseName ?? "a language"} since {memberSince}
            </p>
          )}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3">
        <StatTile
          icon={<Zap className="size-6 fill-current text-saffron-deep" aria-hidden />}
          value={xp}
          label="School XP"
        />
        <StatTile
          icon={<Flame className="size-6 fill-current text-flame" aria-hidden />}
          value={streak}
          label="Day streak"
        />
        <StatTile
          icon={<Gem className="size-6 fill-current text-brand" aria-hidden />}
          value={gems}
          label="Gems"
        />
        <StatTile
          icon={<BookOpen className="size-6 text-verde-deep" aria-hidden />}
          value={user?.lessonsCompleted ?? "…"}
          label="Lessons done"
        />
      </div>

      <p className="mt-6 text-center text-sm text-ink-soft">
        XP, streak and gems are shared across every Travel Schooling class. Your Word Wave
        progress is saved to your school account.
      </p>

      <a
        href={kit.launcherUrl || PORTAL}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-brand-deep bg-brand px-4 py-3 font-display font-extrabold text-white"
      >
        Your school account
        <ExternalLink className="size-4" aria-hidden />
      </a>
    </div>
  );
}
