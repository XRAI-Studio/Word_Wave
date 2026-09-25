"use client";

import { create } from "zustand";
import type { KitAwardResult, KitTotals } from "@/lib/kit";

/**
 * The HUD's totals (work order criterion 20). They are hydrated once per page load, from
 * the kit's `totals` in production or from the server's mock portal in development, and
 * afterwards only move with the totals a completion returns: Word Wave's awards are made
 * on the server, so the kit's own `totals` go stale after the first one.
 */
interface GameState {
  hydrated: boolean;
  xp: number;
  level: number;
  streak: number;
  gems: number;
  hydrate: (t: KitTotals) => void;
  applyAward: (r: KitAwardResult) => void;
}

export const useGameStore = create<GameState>((set) => ({
  hydrated: false,
  xp: 0,
  level: 1,
  streak: 0,
  gems: 0,
  hydrate: ({ xp, level, streak, gems }) => set({ hydrated: true, xp, level, streak, gems }),
  applyAward: ({ xp, level, streak, gems }) => set({ hydrated: true, xp, level, streak, gems }),
}));
