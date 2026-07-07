"use client";

import { cn } from "@/lib/utils";

export function FillBlank({
  value,
  onChange,
  onSubmit,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}) {
  return (
    <input
      type="text"
      autoFocus
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSubmit();
      }}
      aria-label="Your answer"
      placeholder="Type your answer"
      autoComplete="off"
      autoCapitalize="off"
      spellCheck={false}
      className={cn(
        "w-full rounded-2xl border-2 border-b-4 border-line bg-white px-4 py-4 font-semibold",
        "placeholder:text-ink-soft/60",
        "focus:border-brand focus:outline-none",
        "disabled:bg-paper"
      )}
    />
  );
}
