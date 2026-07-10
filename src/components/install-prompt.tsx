"use client";

import { useEffect, useState } from "react";
import { Smartphone, X } from "lucide-react";
import { ChunkyButton } from "@/components/chunky-button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "lingoduo_install_dismissed";

// Shows an "Install app" card when the browser offers a PWA install
// (beforeinstallprompt — Chrome/Edge on Android and desktop). Hidden when
// already installed, previously dismissed, or the event never fires (iOS).
export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || !installEvent) return null;

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    if (outcome === "accepted") setHidden(true);
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setHidden(true);
  }

  return (
    <div className="relative mt-4 rounded-3xl border-2 border-b-4 border-line bg-white p-4">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="absolute right-3 top-3 rounded-full p-1 text-ink-soft hover:bg-paper"
      >
        <X className="size-4" aria-hidden />
      </button>
      <div className="flex items-center gap-3">
        <Smartphone className="size-8 shrink-0 text-brand" aria-hidden />
        <div className="min-w-0">
          <p className="font-display font-extrabold">Install LingoDuo</p>
          <p className="text-sm text-ink-soft">Add it to your home screen and play like an app.</p>
        </div>
      </div>
      <ChunkyButton onClick={install} className="mt-3 w-full">
        Install app
      </ChunkyButton>
    </div>
  );
}
