"use client";

import { ChunkyButton } from "@/components/chunky-button";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-2xl font-extrabold">Something went wrong</h1>
      <p className="mt-2 max-w-md text-ink-soft">
        Your progress is saved locally, so nothing is lost. Try again — if it keeps
        happening, restart the dev server.
      </p>
      <div className="mt-6 flex gap-3">
        <ChunkyButton onClick={() => reset()}>Try again</ChunkyButton>
        <ChunkyButton variant="outline" onClick={() => (window.location.href = "/learn")}>
          Back to the path
        </ChunkyButton>
      </div>
    </div>
  );
}
