"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { House } from "lucide-react";
import { ChunkyButton } from "@/components/chunky-button";
import { HOME, leaveGuard, type UnsavedKind } from "@/lib/leave-guard";
import { cn } from "@/lib/utils";

/** The dialog's words for an unfinished lesson or review (home-room plan). */
export function leaveMessage(kind: UnsavedKind): { title: string; body: string } {
  return {
    title: `Your ${kind} is not finished.`,
    body: `Finish it to save your progress. If you leave now, this ${kind}'s answers are lost.`,
  };
}

/**
 * Asks before unsaved answers are dropped: an in-page modal dialog, focus moved in and
 * kept in, Escape = stay. The overlay is portalled by `useGuardedLeave`; this is the
 * markup alone so it renders (and is tested) without a document.
 */
export function LeaveDialog({
  kind,
  onStay,
  onLeave,
}: {
  kind: UnsavedKind;
  onStay: () => void;
  onLeave: () => void;
}) {
  const titleId = useId();
  const bodyId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const { title, body } = leaveMessage(kind);

  useEffect(() => {
    const dialog = ref.current;
    dialog?.querySelector<HTMLButtonElement>("button")?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onStay();
        return;
      }
      if (e.key !== "Tab" || !dialog) return;
      const buttons = [...dialog.querySelectorAll<HTMLButtonElement>("button")];
      const first = buttons[0];
      const last = buttons[buttons.length - 1];
      if (!dialog.contains(document.activeElement)) {
        e.preventDefault();
        first?.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onStay]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 px-4">
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        className="w-full max-w-md rounded-3xl border-2 border-b-4 border-line bg-white p-6 text-center shadow-xl"
      >
        <h2 id={titleId} className="font-display text-xl font-extrabold text-ink">
          {title}
        </h2>
        <p id={bodyId} className="mt-2 text-ink-soft">
          {body}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <ChunkyButton type="button" onClick={onStay}>
            Stay and save
          </ChunkyButton>
          <ChunkyButton type="button" variant="outline" onClick={onLeave}>
            Leave without saving
          </ChunkyButton>
        </div>
      </div>
    </div>
  );
}

/**
 * A departure through the page's leave guard: waits (at most 2 s) for saves under way,
 * then leaves with a full navigation, or, if answers are still unsaved, asks first.
 * "Leave without saving" disarms the browser prompt before navigating, so the learner is
 * not asked twice.
 */
export function useGuardedLeave() {
  const [prompt, setPrompt] = useState<{ url: string; kind: UnsavedKind } | null>(null);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  // Where focus goes back to when the learner stays.
  const openerRef = useRef<HTMLElement | null>(null);

  // A page restored from the back/forward cache starts over.
  useEffect(() => {
    function onShow(e: PageTransitionEvent) {
      if (!e.persisted) return;
      busyRef.current = false;
      setBusy(false);
      setPrompt(null);
    }
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const request = useCallback(async (url: string, opener: HTMLElement | null) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    const kind = await leaveGuard.depart(url);
    if (kind) {
      busyRef.current = false;
      setBusy(false);
      openerRef.current = opener;
      setPrompt({ url, kind });
    }
    // Otherwise the page is leaving; the button stays busy until it has gone.
  }, []);

  const stay = useCallback(() => {
    const opener = openerRef.current;
    openerRef.current = null;
    setPrompt(null);
    opener?.focus();
  }, []);

  const dialog = prompt
    ? createPortal(
        <LeaveDialog kind={prompt.kind} onStay={stay} onLeave={() => leaveGuard.leave(prompt.url)} />,
        document.body
      )
    : null;

  return { request, busy, dialog };
}

/** Back to the portal's Home Room (plan A3): a DOM button on every main screen. */
export function HomeRoomButton({ className }: { className?: string }) {
  const { request, busy, dialog } = useGuardedLeave();
  return (
    <>
      <button
        type="button"
        onClick={(e) => void request(HOME, e.currentTarget)}
        aria-disabled={busy || undefined}
        className={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-xl border-2 border-b-4 border-line bg-white px-3 py-1.5",
          "font-display text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
          busy && "opacity-60",
          className
        )}
      >
        <House className="size-4" aria-hidden />
        Return to Home Room
      </button>
      {dialog}
    </>
  );
}
