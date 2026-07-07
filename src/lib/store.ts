"use client";

import { create } from "zustand";
import type { UserDTO } from "@/lib/types";

interface GameState {
  hydrated: boolean;
  xp: number;
  streak: number;
  hearts: number;
  gems: number;
  streakFreezes: number;
  hydrate: () => Promise<void>;
  applyRewards: (r: {
    xp: number;
    streakCount: number;
    hearts?: number;
    gems?: number;
    streakFreezes?: number;
  }) => void;
}

export const useGameStore = create<GameState>((set) => ({
  hydrated: false,
  xp: 0,
  streak: 0,
  hearts: 5,
  gems: 0,
  streakFreezes: 0,
  hydrate: async () => {
    const res = await fetch("/api/user");
    if (res.status === 401) {
      // Session expired mid-visit; the proxy only sees cookie presence.
      window.location.href = "/login";
      return;
    }
    if (!res.ok) return;
    const user: UserDTO = await res.json();
    set({
      hydrated: true,
      xp: user.xp,
      streak: user.streakCount,
      hearts: user.hearts,
      gems: user.gems,
      streakFreezes: user.streakFreezes,
    });
  },
  applyRewards: ({ xp, streakCount, hearts, gems, streakFreezes }) =>
    set((s) => ({
      xp,
      streak: streakCount,
      hearts: hearts ?? s.hearts,
      gems: gems ?? s.gems,
      streakFreezes: streakFreezes ?? s.streakFreezes,
    })),
}));
