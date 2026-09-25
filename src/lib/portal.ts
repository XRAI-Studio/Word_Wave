import type { KitAwardResult } from "@/lib/kit";
import { isMockSession, type SessionEnv } from "@/lib/auth-env";

/**
 * Server-side calls to the school ledger (spec §7.2: Word Wave's lesson-complete and
 * review paths award with the learner's own token, never the service role). The same
 * RPCs the kit uses in the browser: `award`, `unlock`, `save_progress`.
 *
 * Every call resolves `null` on any failure (network, non-2xx, timeout) and logs; none
 * throws, because the learner's progress is already committed when these run.
 */

export const GAME = "wordwave";

/** The events and achievement this class may send: exactly the `wordwave` row and
 *  achievement in travelschooling-portal/supabase/seed.sql (lines 5 and 47). */
export const XP_EVENTS = { lesson_complete: 10, review_session: 10 } as const;
export type XpEvent = keyof typeof XP_EVENTS;
export const FIRST_LESSON_ACHIEVEMENT = "wordwave-first-lesson";

export interface Learner {
  /** The verified access token; null in the dev mock session. */
  token: string | null;
  userId: string;
}

export interface LauncherSummary {
  headline: string;
  percent: number;
}

export interface PortalClient {
  award(who: Learner, event: XpEvent, detail: Record<string, unknown>): Promise<KitAwardResult | null>;
  unlock(who: Learner, achievement: string): Promise<KitAwardResult | null>;
  saveSummary(who: Learner, state: { rev: number }, summary: LauncherSummary): Promise<boolean | null>;
}

export interface PortalClientOptions {
  supabaseUrl: string;
  anonKey: string;
  fetch?: typeof fetch;
  timeoutMs?: number;
  log?: (message: string) => void;
}

export function createPortalClient(o: PortalClientOptions): PortalClient {
  const doFetch = o.fetch ?? fetch;
  const timeoutMs = o.timeoutMs ?? 5000;
  const log = o.log ?? ((m: string) => console.error(m));

  async function rpc<T>(who: Learner, name: string, body: unknown): Promise<T | null> {
    if (!who.token) {
      log(`portal ${name}: no access token`);
      return null;
    }
    try {
      const res = await doFetch(`${o.supabaseUrl}/rest/v1/rpc/${name}`, {
        method: "POST",
        headers: {
          apikey: o.anonKey,
          Authorization: `Bearer ${who.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!res.ok) {
        log(`portal ${name}: HTTP ${res.status} ${(await res.text().catch(() => "")).slice(0, 200)}`);
        return null;
      }
      return (await res.json()) as T;
    } catch (err) {
      log(`portal ${name}: ${err instanceof Error ? err.message : String(err)}`);
      return null;
    }
  }

  return {
    award: (who, event, detail) => rpc<KitAwardResult>(who, "award", { p_game: GAME, p_event: event, p_detail: detail }),
    unlock: (who, achievement) => rpc<KitAwardResult>(who, "unlock", { p_achievement: achievement }),
    saveSummary: (who, state, summary) =>
      rpc<boolean>(who, "save_progress", { p_game: GAME, p_state: state, p_summary: summary, p_rev: state.rev }),
  };
}

interface MockTotals {
  xp: number;
  gems: number;
  level: number;
  streak: number;
  awardedToday: Record<string, number>;
  achievements: Set<string>;
  summary: { rev: number; summary: LauncherSummary } | null;
}

/** Per-event daily allowance, as seeded (`per_day`). */
const PER_DAY: Record<XpEvent, number> = { lesson_complete: 20, review_session: 5 };
const ACHIEVEMENT_GEMS: Record<string, number> = { [FIRST_LESSON_ACHIEVEMENT]: 5 };

export interface MockPortal extends PortalClient {
  totals(userId: string): { xp: number; gems: number; level: number; streak: number };
  summary(userId: string): { rev: number; summary: LauncherSummary } | null;
}

/**
 * The dev mock (NEXT_PUBLIC_TS_KIT=mock, never production): the only reward state in
 * local development (work order criterion 20), in this process's memory. It mirrors the
 * portal's caps and the `rev` guard closely enough for e2e; it is not a ledger.
 */
export function createMockPortal(): MockPortal {
  const users = new Map<string, MockTotals>();
  const get = (id: string) => {
    let t = users.get(id);
    if (!t) {
      t = { xp: 0, gems: 0, level: 1, streak: 0, awardedToday: {}, achievements: new Set(), summary: null };
      users.set(id, t);
    }
    return t;
  };
  const view = (t: MockTotals, awarded: number, newAchievements: string[] = []): KitAwardResult => ({
    awarded_xp: awarded,
    xp: t.xp,
    gems: t.gems,
    level: t.level,
    streak: t.streak,
    level_up: false,
    new_achievements: newAchievements,
  });
  return {
    async award(who, event) {
      const t = get(who.userId);
      const used = t.awardedToday[event] ?? 0;
      const grant = used >= PER_DAY[event] ? 0 : XP_EVENTS[event];
      if (grant > 0) {
        t.awardedToday[event] = used + 1;
        t.xp += grant;
        t.streak = Math.max(t.streak, 1);
      }
      return view(t, grant);
    },
    async unlock(who, achievement) {
      const t = get(who.userId);
      const fresh = !t.achievements.has(achievement);
      if (fresh) {
        t.achievements.add(achievement);
        t.gems += ACHIEVEMENT_GEMS[achievement] ?? 0;
      }
      return view(t, 0, fresh ? [achievement] : []);
    },
    async saveSummary(who, state, summary) {
      const t = get(who.userId);
      if (t.summary && t.summary.rev > state.rev) return false;
      t.summary = { rev: state.rev, summary };
      return true;
    },
    totals(userId) {
      const t = get(userId);
      return { xp: t.xp, gems: t.gems, level: t.level, streak: t.streak };
    },
    summary(userId) {
      return get(userId).summary;
    },
  };
}

const globalForPortal = globalThis as unknown as { wordwaveMockPortal?: MockPortal };

/** The mock shared by every route in this dev server process. */
export function mockPortal(): MockPortal {
  globalForPortal.wordwaveMockPortal ??= createMockPortal();
  return globalForPortal.wordwaveMockPortal;
}

export interface PortalEnv extends SessionEnv {
  SUPABASE_ANON_KEY?: string;
}

/** The mock in the dev mock session; otherwise the real client (a misconfiguration logs and yields null). */
export function portalFor(env: PortalEnv = process.env): PortalClient {
  if (isMockSession(env)) return mockPortal();
  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
    const missing = async () => {
      console.error("portal: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_ANON_KEY is not set");
      return null;
    };
    return { award: missing, unlock: missing, saveSummary: missing };
  }
  return createPortalClient({ supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY });
}
