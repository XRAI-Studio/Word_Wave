"use client";

import { useMemo, useState } from "react";
import type { MatchMeta } from "@/lib/types";
import { cn } from "@/lib/utils";

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Match term↔translation. Mismatches flash red and report the involved words
// as misses (like Duolingo match tiles). Completes when all
// pairs are locked.
export function MatchPairs({
  meta,
  onMiss,
  onComplete,
}: {
  meta: MatchMeta;
  onMiss: (wordIds: string[]) => void;
  onComplete: () => void;
}) {
  const left = useMemo(() => shuffle(meta.pairs.map((p) => p.wordId)), [meta]);
  const right = useMemo(() => shuffle(meta.pairs.map((p) => p.wordId)), [meta]);
  const byId = useMemo(() => new Map(meta.pairs.map((p) => [p.wordId, p])), [meta]);

  const [pickedLeft, setPickedLeft] = useState<string | null>(null);
  const [pickedRight, setPickedRight] = useState<string | null>(null);
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [flash, setFlash] = useState<Set<string>>(new Set());

  function attempt(l: string | null, r: string | null) {
    if (!l || !r) return;
    if (l === r) {
      const next = new Set(locked).add(l);
      setLocked(next);
      if (next.size === meta.pairs.length) {
        // Give the last tile a beat to render as locked before completing.
        setTimeout(onComplete, 350);
      }
    } else {
      onMiss([l, r]);
      setFlash(new Set([`L${l}`, `R${r}`]));
      setTimeout(() => setFlash(new Set()), 500);
    }
    setPickedLeft(null);
    setPickedRight(null);
  }

  const tile = (side: "L" | "R", wordId: string) => {
    const pair = byId.get(wordId)!;
    const label = side === "L" ? pair.term : pair.translation;
    const isLocked = locked.has(wordId);
    const isPicked = side === "L" ? pickedLeft === wordId : pickedRight === wordId;
    const isFlashing = flash.has(`${side}${wordId}`);

    return (
      <button
        key={`${side}${wordId}`}
        disabled={isLocked}
        aria-pressed={isPicked}
        onClick={() => {
          if (side === "L") {
            const l = pickedLeft === wordId ? null : wordId;
            setPickedLeft(l);
            attempt(l, pickedRight);
          } else {
            const r = pickedRight === wordId ? null : wordId;
            setPickedRight(r);
            attempt(pickedLeft, r);
          }
        }}
        className={cn(
          "rounded-2xl border-b-4 px-3 py-3 font-semibold transition-colors w-full",
          "focus-visible:outline-2 focus-visible:outline-brand",
          isLocked && "bg-verde-soft border-verde text-verde pointer-events-none opacity-70",
          isFlashing && "bg-heart-soft border-heart text-heart",
          !isLocked && !isFlashing && isPicked && "bg-brand-soft border-brand text-brand",
          !isLocked && !isFlashing && !isPicked && "bg-white border-line hover:bg-paper"
        )}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-3">{left.map((id) => tile("L", id))}</div>
      <div className="flex flex-col gap-3">{right.map((id) => tile("R", id))}</div>
    </div>
  );
}
