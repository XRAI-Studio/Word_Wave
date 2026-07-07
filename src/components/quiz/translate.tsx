"use client";

import type { TranslateMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

// Tap-to-build translation: pick tokens from the word bank into the answer row.
// `value` is the ordered list of picked bank indices (indices keep duplicate
// tokens distinct).
export function Translate({
  meta,
  value,
  onChange,
  disabled,
}: {
  meta: TranslateMeta;
  value: number[];
  onChange: (v: number[]) => void;
  disabled: boolean;
}) {
  const picked = new Set(value);

  return (
    <div>
      <div
        aria-label="Your answer"
        className="min-h-16 rounded-2xl border-2 border-dashed border-line bg-white/60 p-3 flex flex-wrap gap-2"
      >
        {value.length === 0 && (
          <span className="self-center px-1 text-ink-soft">Tap the words below…</span>
        )}
        {value.map((bankIdx) => (
          <button
            key={bankIdx}
            disabled={disabled}
            onClick={() => onChange(value.filter((v) => v !== bankIdx))}
            aria-label={`Remove "${meta.wordBank[bankIdx]}"`}
            className="rounded-xl border-b-4 border-line bg-white px-3 py-2 font-semibold hover:bg-paper focus-visible:outline-2 focus-visible:outline-brand"
          >
            {meta.wordBank[bankIdx]}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {meta.wordBank.map((token, i) => {
          const used = picked.has(i);
          return (
            <button
              key={i}
              disabled={disabled || used}
              onClick={() => onChange([...value, i])}
              className={cn(
                "rounded-xl border-b-4 px-3 py-2 font-semibold transition-colors",
                "focus-visible:outline-2 focus-visible:outline-brand",
                used
                  ? "bg-line/60 border-line text-transparent select-none"
                  : "bg-white border-line hover:bg-paper"
              )}
            >
              {token}
            </button>
          );
        })}
      </div>
    </div>
  );
}
