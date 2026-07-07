"use client";

import { cn } from "@/lib/utils";

// The game's primary control: a chunky tile with a solid bottom edge that
// depresses on press. Color variants map to game semantics.
const variants = {
  primary: "bg-brand text-white border-brand-deep hover:brightness-105",
  success: "bg-verde text-white border-verde-deep hover:brightness-105",
  danger: "bg-heart text-white border-heart-deep hover:brightness-105",
  saffron: "bg-saffron text-ink border-saffron-deep hover:brightness-105",
  outline: "bg-white text-ink border-line hover:bg-paper",
  selected: "bg-brand-soft text-brand border-brand",
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
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        variants[variant],
        disabled && "opacity-40 pointer-events-none",
        className
      )}
      {...props}
    />
  );
}
