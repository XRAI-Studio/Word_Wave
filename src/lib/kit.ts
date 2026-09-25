/**
 * Travel Schooling game kit: the type surface the app relies on, the real-kit
 * loader, and a mock that ports the real kit's save/flush/queue/init code paths
 * (travelschooling-portal/public/kit/v1/ts-kit.js) so tests exercise the same
 * timing behavior, including the debounce that strands superseded save promises.
 */

export interface KitTotals {
  xp: number;
  gems: number;
  level: number;
  streak: number;
}

export interface KitAwardResult {
  queued?: boolean;
  awarded_xp: number;
  xp: number;
  gems: number;
  level: number;
  streak: number;
  level_up: boolean;
  new_achievements: string[];
}

export interface KitUser {
  id: string;
  displayName: string;
  role: string;
}

export interface Kit {
  user: KitUser | null;
  totals: KitTotals;
  launcherUrl: string;
  load(): Promise<unknown>;
  save(state: unknown, summary?: unknown): Promise<void>;
  award(event: string, detail?: Record<string, unknown>): Promise<KitAwardResult>;
  unlock(id: string): Promise<unknown>;
  toast(text: string): void;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.map.set(key, value);
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
}

export interface ProgressRow {
  state: unknown;
  summary: unknown;
  updated_at: string;
}

/** What the real kit sends to `rpc/save_progress`; `rev` is `state.rev` when numeric, else 0. */
export interface SaveProgressArgs {
  state: unknown;
  summary: unknown;
  rev: number;
}

/** The revision inside a stored state, as the SQL guard reads `game_progress.state->>'rev'`. */
export function revOf(state: unknown): number {
  const rev = (state as { rev?: unknown } | null | undefined)?.rev;
  return typeof rev === "number" ? rev : 0;
}

/** The three Supabase endpoints the kit talks to, abstracted so the mock can run anywhere. */
export interface MockTransport {
  getProgress(): Promise<ProgressRow | null>;
  /**
   * `save_progress`: resolves `true` when stored, `false` when the stored state's rev is
   * newer (the save is dropped and that is settled, not dirty); rejects on a network error.
   */
  saveProgress(args: SaveProgressArgs): Promise<boolean>;
  /** `award` / `unlock` resolve objects; `user_today` resolves a bare `YYYY-MM-DD` string, as the real RPC does. */
  rpc(name: string, args: Record<string, unknown>): Promise<Record<string, unknown> | string>;
  getTotals(): Promise<KitTotals | null>;
}

const clone = <T>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));

/** In-memory transport with knobs for failure and latency; also used by the dev-mode kit. */
export class MemoryTransport implements MockTransport {
  progress: ProgressRow | null = null;
  totals: KitTotals = { xp: 0, gems: 0, level: 1, streak: 0 };
  failNextUpsert = false;
  upsertDelayMs = 0;
  failRpc = false;
  unknownEvents = new Set<string>();
  rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  private persist?: StorageLike;
  private persistKey?: string;

  constructor(persist?: { storage: StorageLike; key: string }) {
    if (persist) {
      this.persist = persist.storage;
      this.persistKey = persist.key;
      try {
        const raw = persist.storage.getItem(persist.key);
        if (raw) {
          const parsed = JSON.parse(raw) as { progress?: ProgressRow | null; totals?: KitTotals };
          this.progress = parsed.progress ?? null;
          if (parsed.totals) this.totals = parsed.totals;
        }
      } catch {
        // ignore corrupt dev storage
      }
    }
  }

  private flushPersist() {
    if (!this.persist || !this.persistKey) return;
    try {
      this.persist.setItem(this.persistKey, JSON.stringify({ progress: this.progress, totals: this.totals }));
    } catch {
      // storage may be unavailable
    }
  }

  async getProgress() {
    return this.progress ? clone(this.progress) : null;
  }

  async saveProgress(args: SaveProgressArgs): Promise<boolean> {
    if (this.upsertDelayMs > 0) await new Promise((r) => setTimeout(r, this.upsertDelayMs));
    if (this.failNextUpsert) {
      this.failNextUpsert = false;
      throw new Error("network");
    }
    // The stored row keeps its `{ state, summary, updated_at }` shape; the guard reads the
    // rev inside the stored state, like `0007_progress_revision_guard.sql` does.
    if (this.progress && args.rev < revOf(this.progress.state)) return false;
    this.progress = clone({ state: args.state, summary: args.summary, updated_at: new Date().toISOString() });
    this.flushPersist();
    return true;
  }

  async rpc(name: string, args: Record<string, unknown>) {
    this.rpcCalls.push({ name, args: clone(args) });
    if (name === "award" && this.unknownEvents.has(String(args.p_event))) {
      throw new Error(`unknown event ${String(args.p_event)} for game ${String(args.p_game)}`);
    }
    if (this.failRpc) throw new Error("network");
    if (name === "award") {
      this.totals = { ...this.totals, xp: this.totals.xp + 5 };
      this.flushPersist();
      return { ...this.totals, awarded_xp: 5, level_up: false, new_achievements: [] };
    }
    if (name === "unlock") return { ...this.totals, awarded_xp: 0, level_up: false, new_achievements: [String(args.p_achievement)] };
    if (name === "user_today") return new Date().toISOString().slice(0, 10); // bare string, like the real RPC
    return {};
  }

  async getTotals() {
    return { ...this.totals };
  }
}

export interface MockKitOptions {
  game: string;
  userId: string;
  displayName?: string;
  storage: StorageLike;
  transport: MockTransport;
  launcherUrl?: string;
}

interface CacheEntry {
  state: unknown;
  summary: unknown;
  dirty?: boolean;
}

interface QueuedAward {
  event: string;
  detail: Record<string, unknown>;
  at: number;
}

/** Faithful port of `TSKit.init` for a signed-in learner. Timing matches the real kit (300 ms save debounce). */
export async function createMockKit(o: MockKitOptions): Promise<Kit> {
  const { storage, transport } = o;
  const uid = o.userId;
  const cacheKey = `tskit:${o.game}:${uid}`;
  const queueKey = `${cacheKey}:queue`;

  function ls(key: string): unknown;
  function ls(key: string, val: unknown): void;
  function ls(key: string, val?: unknown): unknown {
    try {
      if (val === undefined) {
        const v = storage.getItem(key);
        return v ? JSON.parse(v) : null;
      }
      storage.setItem(key, JSON.stringify(val));
    } catch {
      return null;
    }
    return undefined;
  }

  const kit: Kit = {
    user: { id: uid, displayName: o.displayName ?? "Dev Learner", role: "student" },
    totals: { xp: 0, gems: 0, level: 1, streak: 0 },
    launcherUrl: o.launcherUrl ?? "https://class.travelschooling.com",
    load: async () => ({}),
    save: async () => undefined,
    award: async () => ({ awarded_xp: 0, xp: 0, gems: 0, level: 1, streak: 0, level_up: false, new_achievements: [] }),
    unlock: async () => ({}),
    toast: () => undefined,
  };

  function rpc(name: string, args: Record<string, unknown>) {
    return transport.rpc(name, args).then((t) => {
      // `award` and `unlock` return the learner's totals; `user_today` returns a string.
      if (t && typeof t === "object" && typeof t.xp === "number") {
        kit.totals = { xp: t.xp as number, gems: t.gems as number, level: t.level as number, streak: t.streak as number };
      }
      return t;
    });
  }

  kit.load = () =>
    transport
      .getProgress()
      .then((server) => {
        const local = ls(cacheKey) as CacheEntry | null;
        if (local && local.dirty) return local.state; // unsent local edit wins until it syncs
        if (server) {
          ls(cacheKey, { state: server.state, summary: server.summary });
          return server.state;
        }
        return local ? local.state : {};
      })
      .catch(() => {
        const local = ls(cacheKey) as CacheEntry | null;
        return local ? local.state : {};
      });

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let pending: { state: unknown; summary: unknown } | null = null;
  function flush(): Promise<void> {
    if (!pending) return Promise.resolve();
    const p = pending;
    pending = null;
    // Mirrors the real kit: save_progress drops a save whose rev is older than the stored
    // state's and answers false; that is settled, not dirty, because the server already
    // holds something newer. Only a rejection (network) leaves the cache dirty.
    return transport
      .saveProgress({ state: p.state, summary: p.summary, rev: revOf(p.state) })
      .then(() => {
        ls(cacheKey, { state: p.state, summary: p.summary });
      })
      .catch(() => {
        ls(cacheKey, { state: p.state, summary: p.summary, dirty: true });
      });
  }
  kit.save = (state, summary) => {
    pending = { state, summary: summary ?? {} };
    ls(cacheKey, { state, summary: summary ?? {}, dirty: true });
    if (saveTimer) clearTimeout(saveTimer); // the earlier promise is never settled, exactly like the real kit
    return new Promise<void>((resolve) => {
      saveTimer = setTimeout(() => {
        flush().then(resolve, resolve);
      }, 300);
    });
  };

  kit.award = (event, detail) =>
    rpc("award", { p_game: o.game, p_event: event, p_detail: detail ?? {} })
      .then((t) => t as unknown as KitAwardResult)
      .catch((err: Error) => {
        if (/session expired|unknown event|not signed in/.test(err.message)) throw err;
        const q = ((ls(queueKey) as QueuedAward[] | null) ?? []).slice();
        q.push({ event, detail: detail ?? {}, at: Date.now() });
        ls(queueKey, q);
        return { queued: true, awarded_xp: 0, ...kit.totals, level_up: false, new_achievements: [] };
      });
  kit.unlock = (id) => rpc("unlock", { p_achievement: id });
  kit.toast = () => undefined;

  // Replay awards queued while offline, then flush dirty local state, then fetch totals.
  const queued = ((ls(queueKey) as QueuedAward[] | null) ?? []).slice();
  const failed: QueuedAward[] = [];
  await queued.reduce(
    (p, q) => p.then(() => rpc("award", { p_game: o.game, p_event: q.event, p_detail: q.detail }).then(() => undefined, () => void failed.push(q))),
    Promise.resolve(),
  );
  ls(queueKey, failed);
  const local = ls(cacheKey) as CacheEntry | null;
  if (local && local.dirty) pending = { state: local.state, summary: local.summary };
  await flush();
  try {
    const t = await transport.getTotals();
    if (t) kit.totals = t;
  } catch {
    // totals stay at defaults
  }
  return kit;
}

declare global {
  interface Window {
    TSKit?: { init(options: { game: string }): Promise<Kit>; version: number };
  }
}

export const KIT_SCRIPT_URL = "https://class.travelschooling.com/kit/v1/ts-kit.js";

/**
 * True when the app should use the mock kit: the env flag outside production builds
 * (the same condition the API routes use for their session bypass), or a localhost origin.
 */
export function shouldUseMockKit(): boolean {
  if (process.env.NEXT_PUBLIC_TS_KIT === "mock" && process.env.NODE_ENV !== "production") return true;
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host === "localhost" || host === "127.0.0.1";
}

/** The one in-flight script load, shared by concurrent callers and cleared when it settles. */
let kitScriptLoad: Promise<void> | null = null;

function injectKitScript(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = KIT_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // A failed element never fires again; drop it so a retry injects a fresh one.
      script.remove();
      reject(new Error("kit failed to load"));
    };
    document.head.appendChild(script);
  });
}

/**
 * Loads the real kit script once and initializes it for this game. Browser only.
 * Concurrent callers share one load; after a failure the next call retries with a new
 * element instead of listening on the dead one.
 */
export async function loadRealKit(game: string): Promise<Kit> {
  if (typeof window === "undefined") throw new Error("kit is browser-only");
  if (!window.TSKit) {
    if (!kitScriptLoad) {
      kitScriptLoad = injectKitScript().finally(() => {
        kitScriptLoad = null;
      });
    }
    await kitScriptLoad;
  }
  if (!window.TSKit) throw new Error("kit unavailable");
  return window.TSKit.init({ game });
}

/** Dev-mode kit backed by localStorage so saves survive reloads on localhost. */
export async function loadDevKit(game: string): Promise<Kit> {
  const storage: StorageLike = typeof window !== "undefined" ? window.localStorage : new MemoryStorage();
  const transport = new MemoryTransport({ storage, key: `factors:mock:${game}` });
  return createMockKit({ game, userId: "mock-user", displayName: "Dev Learner", storage, transport });
}
