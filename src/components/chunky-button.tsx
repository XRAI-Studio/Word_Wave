"use client";

import { cn } from "@/lib/utils";

// The game's primary control: a chunky tile with a solid bottom edge that
// depresses on press. Color variants map to game semantics. Hover darkens (never
// brightens), so white labels keep at least 4.5:1 on the fills in every state.
const variants = {
  primary: "bg-brand text-white border-brand-deep hover:brightness-95",
  success: "bg-verde text-white border-verde-deep hover:brightness-95",
  danger: "bg-heart text-white border-heart-deep hover:brightness-95",
  saffron: "bg-saffron text-on-saffron border-saffron-deep hover:brightness-95",
  // Outline sits on surfaces (dialogs, cards): a full strong boundary, 3.35:1 on white and
  // 3.11:1 on the paper hover fill in light, 4.21 / 4.85 in dark (Codex WW-APPEARANCE-001).
  outline: "bg-surface text-ink border-x-2 border-t-2 border-line-strong hover:bg-paper",
  selected: "bg-brand-soft text-brand-ink border-brand-ink",
} as const;

export type ChunkyVariant = keyof typeof variants;

export function ChunkyButton({
  variant = "primary",
  className,
  disabled,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ChunkyVariant }) {
  return (
    <button
      disabled={disabled}
      className={cn(
        "font-display font-bold uppercase tracking-wide rounded-2xl border-b-4 px-6 py-3",
        "transition-[transform,filter] motion-safe:active:translate-y-0.5 active:border-b-2",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink",
        variants[variant],
        disabled && "opacity-40 pointer-events-none",
        className
      )}
      {...props}
    />
  );
}
