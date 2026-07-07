"use client";

import { create } from "zustand";
import type { UserDTO } from "@/lib/types";

interface GameState {
  hydrated: boolean;
  xp: number;
  streak: number;
  hydrate: () => Promise<void>;
  applyRewards: (r: { xp: number; streakCount: number }) => void;
}

export const useGameStore = create<GameState>((set) => ({
  hydrated: false,
  xp: 0,
  streak: 0,
  hydrate: async () => {
    const res = await fetch("/api/user");
    if (!res.ok) return;
    const user: UserDTO = await res.json();
    set({ hydrated: true, xp: user.xp, streak: user.streakCount });
  },
  applyRewards: ({ xp, streakCount }) => set({ xp, streak: streakCount }),
}));
