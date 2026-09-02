"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { ChunkyButton } from "@/components/chunky-button";

const inputClass =
  "w-full rounded-2xl border-2 border-line bg-white px-4 py-3 font-semibold " +
  "placeholder:text-ink-soft/60 focus:border-brand focus:outline-none";

export function ChangePasswordForm() {
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong — please try again.");
        return;
      }
      setDone(true);
      setOpen(false);
      setCurrentPassword("");
      setNewPassword("");
    } catch {
      setError("Couldn't reach the server — please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="mt-8">
        {done && (
          <p className="mb-3 rounded-2xl border-2 border-verde-deep/40 bg-white px-4 py-3 text-center text-sm font-semibold text-ink-soft">
            Password changed. You&rsquo;ve been signed out on your other devices.
          </p>
        )}
        <ChunkyButton
          variant="outline"
          onClick={() => {
            setDone(false);
            setOpen(true);
          }}
          className="w-full"
        >
          <span className="flex items-center justify-center gap-2">
            <KeyRound className="size-4" aria-hidden />
            Change password
          </span>
        </ChunkyButton>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-3">
      <input
        type="password"
        className={inputClass}
        placeholder="Current password"
        autoComplete="current-password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />
      <input
        type="password"
        className={inputClass}
        placeholder="New password (at least 8 characters)"
        autoComplete="new-password"
        minLength={8}
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        required
      />
      {error && (
        <p role="alert" className="text-center text-sm font-semibold text-heart">
          {error}
        </p>
      )}
      <p className="text-center text-xs text-ink-soft">
        Changing your password signs you out everywhere else.
      </p>
      <div className="flex gap-3">
        <ChunkyButton
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            setOpen(false);
            setError(null);
            setCurrentPassword("");
            setNewPassword("");
          }}
          disabled={busy}
        >
          Cancel
        </ChunkyButton>
        <ChunkyButton type="submit" className="flex-1" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </ChunkyButton>
      </div>
    </form>
  );
}
