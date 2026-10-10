import type { KitAwardResult, KitTotals } from "@/lib/kit";
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
 *  achievement in travelschooling-portal/supabase/seed.sql (lines 5 and 75). Each
 *  event's XP, its daily allowance (`per_day`) and the gems it pays with that XP. */
export const EVENTS = {
  lesson_complete: { xp: 10, per_day: 20, gems: 3 },
  review_session: { xp: 10, per_day: 5, gems: 2 },
} as const;
export type XpEvent = keyof typeof EVENTS;
/** The `wordwave` row's `daily_gem_cap`: event gems a learner may earn here per day. */
export const DAILY_GEM_CAP = 80;
export const FIRST_LESSON_ACHIEVEMENT = "wordwave-first-lesson";

/** What `award` answers since portal migration 0015: the totals plus the event's own gems
 *  (`awarded_gems`, never level-up gems). Optional: recorded outcomes predate it. */
export interface AwardResult extends KitAwardResult {
  awarded_gems?: number;
}

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
  award(who: Learner, event: XpEvent, detail: Record<string, unknown>): Promise<AwardResult | null>;
  unlock(who: Learner, achievement: string): Promise<KitAwardResult | null>;
  saveSummary(who: Learner, state: { rev: number }, summary: LauncherSummary): Promise<boolean | null>;
  /** The learner's totals now (the kit's own `reward_totals` read), for a repeat's HUD. */
  currentTotals(who: Learner): Promise<KitTotals | null>;
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

  async function request<T>(who: Learner, name: string, path: string, init: RequestInit): Promise<T | null> {
    if (!who.token) {
      log(`portal ${name}: no access token`);
      return null;
    }
    try {
      const res = await doFetch(`${o.supabaseUrl}${path}`, {
        ...init,
        headers: {
          apikey: o.anonKey,
          Authorization: `Bearer ${who.token}`,
          ...(init.body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
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

  const rpc = <T>(who: Learner, name: string, body: unknown) =>
    request<T>(who, name, `/rest/v1/rpc/${name}`, { method: "POST", body: JSON.stringify(body) });

  return {
    award: (who, event, detail) => rpc<AwardResult>(who, "award", { p_game: GAME, p_event: event, p_detail: detail }),
    unlock: (who, achievement) => rpc<KitAwardResult>(who, "unlock", { p_achievement: achievement }),
    saveSummary: (who, state, summary) =>
      rpc<boolean>(who, "save_progress", { p_game: GAME, p_state: state, p_summary: summary, p_rev: state.rev }),
    async currentTotals(who) {
      const rows = await request<KitTotals[]>(
        who,
        "reward_totals",
        `/rest/v1/reward_totals?select=xp,gems,level,streak&user_id=eq.${encodeURIComponent(who.userId)}`,
        { method: "GET" }
      );
      const t = rows?.[0];
      return t && typeof t.xp === "number" ? { xp: t.xp, gems: t.gems, level: t.level, streak: t.streak } : null;
    },
  };
}

interface MockTotals {
  xp: number;
  gems: number;
  level: number;
  streak: number;
  awardedToday: Record<string, number>;
  /** Event gems paid today in this game; level-up and achievement gems do not count. */
  gemsToday: number;
  achievements: Set<string>;
  summary: { rev: number; summary: LauncherSummary } | null;
}

const ACHIEVEMENT_GEMS: Record<string, number> = { [FIRST_LESSON_ACHIEVEMENT]: 25 };

/** The portal's event-gem grant: the event's gems, up to what is left of the day's cap
 *  (a cap of 0 pays no event gems). Only called for a use that was granted XP. */
export function gemGrant(gems: number, gemsToday: number, cap: number): number {
  if (gems <= 0 || cap <= 0) return 0;
  return Math.min(gems, Math.max(cap - gemsToday, 0));
}

export interface MockPortal extends PortalClient {
  totals(userId: string): { xp: number; gems: number; level: number; streak: number };
  summary(userId: string): { rev: number; summary: LauncherSummary } | null;
}

/**
 * The dev mock (NEXT_PUBLIC_TS_KIT=mock, never production): the only reward state in
 * local development (work order criterion 20), in this process's memory. It mirrors the
 * portal's per-day caps, per-event gems (migration 0015: paid only with XP, up to the daily
 * gem cap) and the `rev` guard closely enough for e2e; it is not a ledger, and has no
 * levels, day rollover or daily XP cap.
 */
export function createMockPortal(): MockPortal {
  const users = new Map<string, MockTotals>();
  const get = (id: string) => {
    let t = users.get(id);
    if (!t) {
      t = { xp: 0, gems: 0, level: 1, streak: 0, awardedToday: {}, gemsToday: 0, achievements: new Set(), summary: null };
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
      const { xp, per_day, gems } = EVENTS[event];
      const used = t.awardedToday[event] ?? 0;
      const grant = used >= per_day ? 0 : xp;
      let grantGems = 0;
      if (grant > 0) {
        t.awardedToday[event] = used + 1;
        t.xp += grant;
        t.streak = Math.max(t.streak, 1);
        grantGems = gemGrant(gems, t.gemsToday, DAILY_GEM_CAP);
        t.gemsToday += grantGems;
        t.gems += grantGems;
      }
      return { ...view(t, grant), awarded_gems: grantGems };
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
    async currentTotals(who) {
      const t = get(who.userId);
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
    return { award: missing, unlock: missing, saveSummary: missing, currentTotals: missing };
  }
  return createPortalClient({ supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL, anonKey: env.SUPABASE_ANON_KEY });
}
