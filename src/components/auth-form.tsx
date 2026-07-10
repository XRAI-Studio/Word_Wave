"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChunkyButton } from "@/components/chunky-button";

const GOOGLE_ERRORS: Record<string, string> = {
  "google-not-configured": "Google sign-in isn't set up on this server.",
  "google-state": "Google sign-in was interrupted — please try again.",
  "google-token": "Google sign-in failed — please try again.",
  "google-profile": "Couldn't read your Google profile — please try again.",
};

const inputClass =
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 font-semibold " +
  "placeholder:text-ink-soft/60 focus:border-brand focus:outline-none";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(() => {
    const authError = searchParams.get("error");
    return authError ? (GOOGLE_ERRORS[authError] ?? "Sign-in failed — please try again.") : null;
  });
  const [busy, setBusy] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/auth/providers")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { google: boolean }) => setGoogleEnabled(d.google))
      .catch(() => {});
  }, []);

  async function playAsGuest() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/guest", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "Something went wrong — please try again.");
        return;
      }
      router.push("/learn");
      router.refresh();
    } catch {
      setError("Couldn't reach the server — please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          mode === "register" ? { email, password, displayName } : { email, password }
        ),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong — please try again.");
        return;
      }
      router.push("/learn");
      router.refresh();
    } catch {
      setError("Couldn't reach the server — please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <Link href="/" className="font-display text-3xl font-extrabold text-brand">
        LingoDuo
      </Link>
      <h1 className="mt-6 font-display text-xl font-extrabold">
        {mode === "login" ? "Welcome back" : "Create your profile"}
      </h1>
      <p className="mt-1 text-center text-sm text-ink-soft">
        Your progress syncs to your account — play on your phone or PC.
      </p>

      <form onSubmit={submit} className="mt-8 w-full max-w-sm space-y-3">
        {mode === "register" && (
          <input
            className={inputClass}
            type="text"
            placeholder="Display name"
            aria-label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
            maxLength={60}
          />
        )}
        <input
          className={inputClass}
          type="email"
          placeholder="Email"
          aria-label="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className={inputClass}
          type="password"
          placeholder={mode === "register" ? "Password (8+ characters)" : "Password"}
          aria-label="Password"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={mode === "register" ? 8 : 1}
        />

        {error && (
          <p role="alert" className="rounded-xl bg-heart-soft px-4 py-2 text-sm font-semibold text-heart-deep">
            {error}
          </p>
        )}

        <ChunkyButton type="submit" disabled={busy} className="w-full">
          {busy ? "One moment…" : mode === "login" ? "Log in" : "Sign up"}
        </ChunkyButton>
      </form>

      {(googleEnabled || mode === "login") && (
        <div className="mt-4 w-full max-w-sm">
          <div className="flex items-center gap-3 py-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
            <span className="h-px flex-1 bg-line" aria-hidden /> or
            <span className="h-px flex-1 bg-line" aria-hidden />
          </div>
          {googleEnabled && (
            <a
              href="/api/auth/google"
              className="block w-full rounded-2xl border-2 border-b-4 border-line bg-white px-4 py-3 text-center font-display font-bold hover:bg-paper"
            >
              Continue with Google
            </a>
          )}
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={playAsGuest}
                disabled={busy}
                className="mt-3 block w-full rounded-2xl border-2 border-b-4 border-line bg-white px-4 py-3 text-center font-display font-bold hover:bg-paper disabled:opacity-60"
              >
                Try it without an account
              </button>
              <p className="mt-2 text-center text-xs text-ink-soft">
                Progress isn&apos;t saved in guest mode.
              </p>
            </>
          )}
        </div>
      )}

      <p className="mt-8 text-sm text-ink-soft">
        {mode === "login" ? (
          <>
            New to LingoDuo?{" "}
            <Link href="/register" className="font-bold text-brand hover:underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-brand hover:underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
