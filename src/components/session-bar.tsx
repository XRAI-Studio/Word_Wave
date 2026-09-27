"use client";

import { HomeRoomButton } from "@/components/home-room";

/**
 * The bar above every branch of a quiz page (/lesson/[lessonId], /review/session):
 * the quiz, loading, the result screen, PendingRecovery and an empty review.
 */
export function SessionBar() {
  return (
    <div className="mx-auto flex w-full max-w-3xl justify-end px-4 pt-3" data-testid="session-bar">
      <HomeRoomButton />
    </div>
  );
}

/** A quiz page: its own document, with the Home Room bar above whatever it shows. */
export function SessionPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <SessionBar />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
