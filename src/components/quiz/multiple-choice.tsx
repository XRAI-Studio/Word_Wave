"use client";

import type { MultipleChoiceMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

export function MultipleChoice({
  meta,
  value,
  onChange,
  disabled,
}: {
  meta: MultipleChoiceMeta;
  value: string | null;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  return (
    <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
      {meta.choices.map((choice, i) => {
        const selected = value === choice;
        return (
          <button
            key={choice}
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(choice)}
            className={cn(
              "rounded-2xl border-b-4 px-4 py-4 text-left font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
              selected
                ? "bg-brand-soft border-brand text-brand"
                : "bg-white border-line hover:bg-paper"
            )}
          >
            <span className="mr-3 inline-flex size-7 items-center justify-center rounded-lg border border-current/30 font-display text-sm">
              {i + 1}
            </span>
            {choice}
          </button>
        );
      })}
    </div>
  );
}
