"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChunkyButton } from "@/components/chunky-button";
import { reloadForAccountChange, takeAccountChangedNotice } from "@/lib/account-change";
import { apiFetch, RedirectingError } from "@/lib/api-fetch";
import { loadDevKit, loadRealKit, shouldUseMockKit, type Kit } from "@/lib/kit";
import { useGameStore } from "@/lib/store";
import type { UserDTO } from "@/lib/types";

/** The portal game slug (travelschooling-portal `games.slug`). */
const GAME = "wordwave";

type Boot =
  | { status: "loading" }
  | { status: "ready"; kit: Kit }
  | { status: "redirecting" }
  | { status: "kit-failed" };

const KitContext = createContext<Kit | null>(null);

/** The booted kit. Only rendered children call this, and they render once it is ready. */
export function useKit(): Kit {
  const kit = useContext(KitContext);
  if (!kit) throw new Error("useKit outside a ready KitProvider");
  return kit;
}

/**
 * Boots the portal kit once per page load for every page (root layout, so the quiz
 * routes outside `(main)` are covered too) and shows the two standard screens (class
 * standard rule 3.4): `redirecting` when the kit has sent the learner to sign in, and
 * `kit-failed` with a retry that re-runs the boot without a reload.
 */
export function KitProvider({ children }: { children: React.ReactNode }) {
  const [boot, setBoot] = useState<Boot>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  const hydrate = useGameStore((s) => s.hydrate);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mock = shouldUseMockKit();
        const kit = mock ? await loadDevKit(GAME) : await loadRealKit(GAME);
        if (cancelled) return;
        // The real kit, finding no session, starts navigating to the portal and resolves
        // with no user: build nothing on it.
        if (!kit.user) {
          setBoot({ status: "redirecting" });
          return;
        }
        if (mock) {
          // Dev: the server's mock portal is the only reward state (criterion 20).
          const res = await apiFetch("/api/user");
          const user: UserDTO | null = res.ok ? await res.json() : null;
          if (user?.devTotals) hydrate(user.devTotals);
        } else {
          hydrate(kit.totals);
        }
        if (!cancelled) setBoot({ status: "ready", kit });
      } catch (err) {
        if (cancelled) return;
        setBoot(err instanceof RedirectingError ? { status: "redirecting" } : { status: "kit-failed" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [attempt, hydrate]);

  // Another tab may sign in to the portal as someone else; the shared cookie changes but
  // this page's kit does not. Re-check the signed-in learner whenever the tab comes back
  // into view and reload under the new identity if it differs (WW-P5-R3-002).
  const readyUserId = boot.status === "ready" ? boot.kit.user?.id : undefined;
  useEffect(() => {
    if (!readyUserId) return;
    if (takeAccountChangedNotice()) {
      toast.message("You're signed in as a different learner now. The last unsaved answers were not kept.");
    }
    let checking = false;
    const check = async () => {
      if (checking || document.visibilityState !== "visible") return;
      checking = true;
      try {
        const res = await apiFetch("/api/user");
        if (res.ok) {
          const me: UserDTO = await res.json();
          if (me.id !== readyUserId) reloadForAccountChange();
        }
      } catch {
        // A redirect is already under way, or the network blipped; the next focus retries.
      } finally {
        checking = false;
      }
    };
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [readyUserId]);

  if (boot.status === "ready") {
    return <KitContext.Provider value={boot.kit}>{children}</KitContext.Provider>;
  }
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      {boot.status === "loading" && (
        <p className="font-display font-bold text-ink-soft" aria-live="polite" data-testid="kit-loading">
          Loading…
        </p>
      )}
      {boot.status === "redirecting" && (
        <p className="font-display font-bold text-ink-soft" aria-live="polite" data-testid="redirecting">
          Sending you to sign in…
        </p>
      )}
      {boot.status === "kit-failed" && (
        <div data-testid="kit-failed" className="flex flex-col items-center gap-4">
          <p className="font-display text-xl font-extrabold">Couldn&apos;t reach the school</p>
          <p className="text-ink-soft">Check your connection, then try again.</p>
          <ChunkyButton
            onClick={() => {
              setBoot({ status: "loading" });
              setAttempt((n) => n + 1);
            }}
          >
            Try again
          </ChunkyButton>
        </div>
      )}
    </div>
  );
}
