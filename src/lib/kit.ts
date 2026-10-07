/**
 * Travel Schooling game kit: the type surface the app relies on, the real-kit
 * loader, and a mock that ports the real kit's save/flush/queue/init code paths
 * (travelschooling-portal/public/kit/v1/ts-kit.js) so tests exercise the same
 * timing behavior, including the debounce that strands superseded save promises.
 *
 * `save()` resolves a `SaveResult` saying where the state ended up: `"server"` (the
 * server answered, stored or already newer), `"local"` (the network failed and the dirty
 * cache holds it; the next init flushes it) or `"none"` (both failed: only the page's
 * memory holds it). It never rejects. `undefined` means an older kit build that reported
 * nothing; callers must treat it as unknown and fall back to their own checks.
 *
 * `load({ strict: true })` rejects with an error whose `code` is `"progress-unavailable"`
 * (`isProgressUnavailable(err)`) when the progress read fails, whatever the local cache
 * holds; a strict caller builds no state and writes nothing from it, and retries later.
 * Without the option a failed read resolves the cached state, else `{}`, as before. The
 * successful-read path is the same either way. An older kit ignores the option.
 *
 * Cross-device sync is opt-in: `TSKit.init({ game, merge, summarize })`. Without `merge` the
 * kit is exactly the above (`save_progress` with the rev guard, `{ state, summary, dirty? }`
 * caches, no device id). With it:
 * - `merge(mine, theirs)` must be idempotent (`merge(x, x) = x`), commutative and
 *   associative; the kit never tracks whether a write landed and may send the same state twice.
 * - Saves go through `save_progress_versioned`, naming the server version their copy contains.
 *   On a conflict the kit combines with the server's copy and saves again (at most 3 conflict
 *   rounds, then `"local"`). The kit keeps `known = { state, version }` in memory: whatever it
 *   sends against version V, or caches labelled V, contains `known.state` at V; a value it
 *   cannot fold (a throwing `merge`) is labelled `null` (sent as -1, never matches).
 * - Storage: each kit instance (page load) keeps its unsent work in its own entry,
 *   `tskit:<game>:<uid>:unsent:<id>`, which only it writes or removes; every instance gathers the
 *   others' entries (and an old kit's dirty entry) into what it sends, and removes them once the
 *   server holds them. Copies of server data are kept as one entry per version,
 *   `tskit:<game>:<uid>:known:<version>`; the highest wins. The legacy entry is not written in
 *   this mode.
 * - `save()` snapshots its arguments when called; an unserializable state resolves `"none"`.
 *   When combining happened the result carries `merged: <state>`, what the class should show.
 * - `kit.deviceId` is a lasting id for this browser (storage key `tskit:device`).
 * - `kit.refresh(current)` never rejects: `{ changed: true, state }` when the server holds a
 *   newer version (combined with `current`), `{ changed: false, busy: true }` while a save is
 *   pending or in flight, else `{ changed: false }`.
 * - Safe mode: if `merge` ever throws, `kit.syncBroken` becomes true for the rest of the page.
 *   Saves then stay on the device (`"local"`, or `"none"` if storage fails) and nothing is
 *   sent; load returns this device's own copy (a strict load still rejects when the read
 *   fails) and refresh reports no change. The next page load replays the work through a fresh kit.
 */

/** The `code` of the error a strict `load()` rejects with when the progress read failed. */
export const PROGRESS_UNAVAILABLE = "progress-unavailable";

/** True for the rejection of `kit.load({ strict: true })` whose progress read failed. */
export function isProgressUnavailable(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === PROGRESS_UNAVAILABLE;
}

function progressUnavailable(): Error {
  return Object.assign(new Error("progress unavailable"), { code: PROGRESS_UNAVAILABLE });
}

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

/** Where a `save()` left the state; see the header comment. */
export interface SaveResult {
  stored: "server" | "local" | "none";
  /** Versioned mode: the combined state the class should show, when it differs from what it saved. */
  merged?: unknown;
}

/** `merge(mine, theirs)`: idempotent, commutative and associative (see the header comment). */
export type MergeFn = (mine: unknown, theirs: unknown) => unknown;

/** Opting in to cross-device sync: with `merge` the kit saves with versions. */
export interface SyncOptions {
  merge?: MergeFn;
  summarize?: (state: unknown) => unknown;
}

export type RefreshResult = { changed: false; busy?: true } | { changed: true; state: unknown };

export interface Kit {
  user: KitUser | null;
  totals: KitTotals;
  launcherUrl: string;
  /** Versioned mode only: a lasting id for this browser. */
  deviceId?: string;
  /** Versioned mode only: true once the class's merge has thrown (safe mode); absent without merge. */
  syncBroken?: boolean;
  /** Versioned mode: picks up another device's newer save; never rejects. Older kits lack it. */
  refresh?(current: unknown): Promise<RefreshResult>;
  /** With `{ strict: true }` a failed read rejects (`isProgressUnavailable`); see the header comment. */
  load(options?: { strict?: boolean }): Promise<unknown>;
  /** Resolves the outcome (or `undefined` from an older kit build); never rejects. */
  save(state: unknown, summary?: unknown): Promise<SaveResult | undefined>;
  award(event: string, detail?: Record<string, unknown>): Promise<KitAwardResult>;
  unlock(id: string): Promise<unknown>;
  toast(text: string): void;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  /** Number of keys; with `key(i)`, lets the versioned kit find other tabs' unsent entries. */
  readonly length: number;
  key(index: number): string | null;
}

export class MemoryStorage implements StorageLike {
  private map = new Map<string, string>();
  get length() {
    return this.map.size;
  }
  key(index: number) {
    return Array.from(this.map.keys())[index] ?? null;
  }
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
  /** Trigger-maintained server version; a row without it counts as version 1 (the backfill). */
  version?: number;
  /**
   * Server-side only (the progress read does not select it): set once `save_progress_versioned`
   * has written the row; from then on the old `save_progress` is refused.
   */
  synced?: boolean;
}

/** What `save_progress_versioned` answers. */
export type VersionedSaveResult = { ok: true; version: number } | { ok: false; version: number; state: unknown; summary: unknown };

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
  /**
   * `save_progress_versioned`: lands only when the row is still at `baseVersion` (0 = no row;
   * -1 never matches); otherwise writes nothing and answers the current copy. Rejects on a
   * network error or an unapproved learner.
   */
  saveProgressVersioned(args: { state: unknown; summary: unknown; baseVersion: number }): Promise<VersionedSaveResult>;
  /** `award` / `unlock` resolve objects; `user_today` resolves a bare `YYYY-MM-DD` string, as the real RPC does. */
  rpc(name: string, args: Record<string, unknown>): Promise<Record<string, unknown> | string>;
  getTotals(): Promise<KitTotals | null>;
}

/**
 * Failure switches shared by every transport that holds it, so a test or the e2e can turn
 * reads or saves off before the page loads and keep them off across a retry's new kit.
 */
export interface MockControl {
  failReads?: boolean;
  failUpserts?: boolean;
}

const clone = <T>(v: T): T => (v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T));

/** In-memory transport with knobs for failure and latency; also used by the dev-mode kit. */
export class MemoryTransport implements MockTransport {
  progress: ProgressRow | null = null;
  totals: KitTotals = { xp: 0, gems: 0, level: 1, streak: 0 };
  failNextUpsert = false;
  /** While set, every `saveProgress` rejects (persistent; `failNextUpsert` is one-shot). */
  failUpserts = false;
  /** While set, every `getProgress` rejects (persistent), like a failed progress read. */
  failReads = false;
  /** Optional shared switches, consulted on every call in addition to this transport's own flags. */
  control?: MockControl;
  upsertDelayMs = 0;
  /** Versioned saves: this many of the next ones find that another device saved first. */
  forceConflicts = 0;
  /** While false, `saveProgressVersioned` rejects ("not approved"), like the RPC's error. */
  approved = true;
  /** One-shot: the next versioned save commits, then its answer is lost (rejects). */
  loseAnswer = false;
  failRpc = false;
  unknownEvents = new Set<string>();
  rpcCalls: Array<{ name: string; args: Record<string, unknown> }> = [];
  private persist?: StorageLike;
  private persistKey?: string;

  constructor(persist?: { storage: StorageLike; key: string }, control?: MockControl) {
    this.control = control;
    if (persist) {
      this.persist = persist.storage;
      this.persistKey = persist.key;
      try {
        const raw = persist.storage.getItem(persist.key);
        if (raw) {
          const parsed = JSON.parse(raw) as { progress?: ProgressRow | null; totals?: KitTotals };
          // A row persisted before versions existed restores as version 1, as the backfill does.
          this.progress = parsed.progress ? { ...parsed.progress, version: parsed.progress.version ?? 1 } : null;
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
    if (this.failReads || this.control?.failReads) throw new Error("network");
    if (!this.progress) return null;
    const row = clone(this.progress);
    delete row.synced; // the read selects state, summary, updated_at, version
    return row;
  }

  async saveProgress(args: SaveProgressArgs): Promise<boolean> {
    if (this.upsertDelayMs > 0) await new Promise((r) => setTimeout(r, this.upsertDelayMs));
    if (this.failUpserts || this.control?.failUpserts) throw new Error("network");
    if (this.failNextUpsert) {
      this.failNextUpsert = false;
      throw new Error("network");
    }
    // Once a versioned save has written the row, the server refuses this path whatever the
    // rev, before the rev guard could drop it as stale (0014, CDS1-008); the row is unchanged.
    if (this.progress?.synced) throw new Error("progress is synced: use save_progress_versioned");
    // The guard reads the rev inside the stored state, like `0007_progress_revision_guard.sql`
    // does. Every accepted write bumps the version, as the version trigger does.
    if (this.progress && args.rev < revOf(this.progress.state)) return false;
    const version = (this.progress ? (this.progress.version ?? 1) : 0) + 1;
    this.progress = clone({ state: args.state, summary: args.summary, updated_at: new Date().toISOString(), version });
    this.flushPersist();
    return true;
  }

  async saveProgressVersioned(args: { state: unknown; summary: unknown; baseVersion: number }): Promise<VersionedSaveResult> {
    if (this.upsertDelayMs > 0) await new Promise((r) => setTimeout(r, this.upsertDelayMs));
    if (this.failNextUpsert || this.failUpserts || this.control?.failUpserts) {
      this.failNextUpsert = false;
      throw new Error("network");
    }
    if (!this.approved) throw new Error("not approved");
    if (this.forceConflicts > 0 && this.progress) {
      this.forceConflicts--;
      this.progress = { ...this.progress, version: (this.progress.version ?? 1) + 1 }; // another device saved
    }
    const cur = this.progress ? (this.progress.version ?? 1) : 0;
    if (args.baseVersion >= 0 && args.baseVersion === cur) {
      this.progress = clone({ state: args.state, summary: args.summary, updated_at: new Date().toISOString(), version: cur + 1, synced: true });
      this.flushPersist();
      if (this.loseAnswer) {
        this.loseAnswer = false;
        throw new Error("network");
      }
      return { ok: true, version: cur + 1 };
    }
    return { ok: false, version: cur, state: this.progress ? clone(this.progress.state) : {}, summary: this.progress ? clone(this.progress.summary) : {} };
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

export interface MockKitOptions extends SyncOptions {
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
  /** Versioned mode: the server version `state` contains, or null when unknown. */
  version?: number | null;
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

  /** Read: the parsed value, or null. Write: true when stored, false when `setItem` threw. */
  function ls(key: string): unknown;
  function ls(key: string, val: unknown): boolean;
  function ls(key: string, val?: unknown): unknown {
    if (val === undefined) {
      try {
        const v = storage.getItem(key);
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    }
    try {
      storage.setItem(key, JSON.stringify(val));
      return true;
    } catch {
      return false;
    }
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

  // Cross-device sync (opt-in with { merge }). The class's merge(mine, theirs) is
  // idempotent, commutative and associative, so sending the same state twice is harmless:
  // the kit never needs to know whether a write landed. `known` (in memory) holds
  // everything this device has received from or sent to the server up to `known.version`.
  // Whatever is sent against version V, or stored labelled V, contains known.state at V; a
  // value that is not paired with a version (nothing known yet, or safe mode) is labelled
  // null (sent as -1, which never matches). known.version never decreases, so an older
  // answer never wins.
  //
  // Storage. The legacy entry (cacheKey) keeps its meaning for kits without merge and is never
  // written here. Each kit instance (page load) has a random writerId and:
  //   cacheKey + ":unsent:" + writerId - its own recovery entry { state, summary, version, at }:
  //     its unsent work folded with known.state, paired. Only this instance writes or removes
  //     it, so no other tab, versioned or legacy, can overwrite it (CDS1-013, CDS1-014). It is
  //     rewritten whenever `unsent` changes and removed when `unsent` is cleared.
  //   cacheKey + ":known:" + version - caches of server data only { state, summary, version },
  //     one immutable entry per version, never rewritten, so tabs writing at once cannot put an
  //     older copy over a newer one (CDS1-019). The highest version present is the known copy;
  //     a writer removes only lower versions. A ":known" entry from earlier builds is read as
  //     one more candidate. Losing them loses nothing.
  // gather() folds other instances' entries, and a dirty legacy entry (an old kit's unsent
  // edit), into this instance's unsent work, so they are sent with it; cleanup() removes them
  // once the server holds them.
  //
  // Safe mode: the first time the class's merge throws, this kit stops combining for the
  // rest of the page (`broken`, exposed as kit.syncBroken). Every save is then kept on the
  // device only (its own entry, version null), nothing is sent, unsent work is never
  // cleared, nothing is removed, and load/refresh neither learn nor write the known copy:
  // load returns this device's own copy, refresh reports no change. Nothing is lost: the
  // next page load starts a fresh kit, which gathers and replays the entry.
  const versioned = typeof o.merge === "function";
  let known: { state: unknown; version: number } | null = null;
  let inFlight = 0;
  let broken = false;
  const unsentPrefix = cacheKey + ":unsent:";
  const knownPrefix = cacheKey + ":known:";
  const oldKnownKey = cacheKey + ":known";
  const ownKey = unsentPrefix + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  const copy = <T>(x: T): T => (x === undefined ? x : (JSON.parse(JSON.stringify(x)) as T));
  function canon(x: unknown): string | undefined {
    if (x === null || typeof x !== "object") return JSON.stringify(x) as string | undefined;
    if (Array.isArray(x)) return "[" + x.map(canon).join(",") + "]";
    const obj = x as Record<string, unknown>;
    return "{" + Object.keys(obj).sort().map((k) => JSON.stringify(k) + ":" + canon(obj[k])).join(",") + "}";
  }
  const same = (a: unknown, b: unknown) => canon(a) === canon(b);
  // The class's merge on detached copies. Once it has thrown, it is never called again.
  function combine(a: unknown, b: unknown): { ok: true; value: unknown } | { ok: false } {
    if (broken) return { ok: false };
    try {
      return { ok: true, value: copy(o.merge!(copy(a), copy(b))) };
    } catch {
      broken = true;
      kit.syncBroken = true;
      return { ok: false };
    }
  }
  // Fold known.state into a value: { value, version } paired correctly, or version null.
  function pair(value: unknown): { value: unknown; version: number | null } {
    if (!known) return { value, version: null };
    const c = combine(value, known.state);
    return c.ok ? { value: c.value, version: known.version } : { value, version: null };
  }
  // Fold a server copy into `known`. False in safe mode, and `known` is left as it was.
  function learn(state: unknown, version: number): boolean {
    if (broken) return false;
    if (!known) {
      known = { state: copy(state), version };
      return true;
    }
    const c = combine(known.state, state);
    if (!c.ok) return false;
    known = { state: c.value, version: Math.max(known.version, version) };
    return true;
  }
  // Unsent work, held in memory independently of `known` and of storage. It is cleared only
  // by an acknowledgement of a state that already contains it. When a fold fails (safe mode),
  // a new save() snapshot replaces it (the class's snapshots are cumulative), but work from
  // anywhere else (another instance's entry, a read's view) never replaces what memory holds:
  // it may be older (CDS1-011).
  let unsent: unknown = null;
  function addUnsent(state: unknown, isSnapshot?: boolean) {
    if (!unsent) {
      unsent = copy(state);
      return;
    }
    const c = combine(unsent, state);
    if (c.ok) unsent = c.value;
    else if (isSnapshot) unsent = copy(state);
  }
  function summaryOf(state: unknown, fallback: unknown): unknown {
    try {
      return o.summarize ? o.summarize(copy(state)) : fallback;
    } catch {
      return fallback;
    }
  }
  // The latest save() snapshot: the class's own summary while a state is what it saved.
  let lastSave: { state: unknown; summary: unknown } = { state: undefined, summary: {} };
  const ownSummary = (st: unknown) => (same(st, lastSave.state) ? lastSave.summary : summaryOf(st, lastSave.summary));
  // Write this instance's own entry from memory (unsent work paired with known.state; version
  // null in safe mode), or remove it when nothing is unsent. It is removed only once the known
  // copy is stored at least as current as memory: until then a reload would start from an
  // older copy, so the entry is rewritten with known.state instead (replaying it is harmless)
  // or, if that write fails too, left as it is (CDS1-016). True when memory is on the device.
  function saveOwn(): boolean {
    if (!unsent) {
      if (known && !knownStored()) {
        ls(ownKey, { state: known.state, summary: ownSummary(known.state), version: known.version, at: Date.now() });
        return true;
      }
      try {
        storage.removeItem(ownKey);
      } catch {
        // storage may be unavailable
      }
      return true;
    }
    const pr = pair(unsent);
    return ls(ownKey, { state: pr.value, summary: ownSummary(pr.value), version: pr.version, at: Date.now() });
  }
  // Every stored known copy's key: the per-version entries and an earlier build's ":known".
  function knownKeys(): string[] {
    const keys: string[] = [];
    try {
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.indexOf(knownPrefix) === 0) keys.push(k);
      }
    } catch {
      // storage may be unavailable
    }
    keys.push(oldKnownKey);
    return keys;
  }
  // The stored known copy with the highest version, or null.
  function readKnown(): (CacheEntry & { version: number }) | null {
    let best: (CacheEntry & { version: number }) | null = null;
    for (const key of knownKeys()) {
      const e = ls(key) as CacheEntry | null;
      if (e && typeof e.version === "number" && e.state !== undefined && (!best || e.version > best.version)) best = e as CacheEntry & { version: number };
    }
    return best;
  }
  // Whether a stored known copy is at least as current as memory.
  function knownStored(): boolean {
    const top = readKnown();
    return !!(top && top.version >= known!.version);
  }
  // Store the known copy (server data only) as the entry for its version, unless that version
  // or a higher one is stored already; then remove lower versions only, never a higher one
  // another tab may have written meanwhile. True when a copy at least as current is stored.
  function saveKnown(summary: unknown): boolean {
    if (!known) return false;
    if (knownStored()) return true;
    if (!ls(knownPrefix + known.version, { state: known.state, summary, version: known.version })) return knownStored();
    for (const key of knownKeys()) {
      const e = ls(key) as CacheEntry | null;
      if (e && typeof e.version === "number" && e.version < known.version) {
        try {
          storage.removeItem(key);
        } catch {
          // storage may be unavailable
        }
      }
    }
    return true;
  }
  // Seed `known` from the highest known copy, or from a legacy clean entry with a numeric version.
  function seedKnown() {
    if (known) return;
    let k: CacheEntry | null = readKnown();
    const legacy = ls(cacheKey) as CacheEntry | null;
    if (legacy && !legacy.dirty && typeof legacy.version === "number" && (!k || legacy.version > (k.version as number))) k = legacy;
    if (k) known = { state: copy(k.state), version: k.version as number };
  }
  // Fold every other instance's entry, and a dirty legacy entry, into `unsent` (never
  // replacing memory on a failed fold) and rewrite this instance's own entry if that changed
  // it. Returns what it found, [{ key, state, summary }], for cleanup().
  function gather(): Array<{ key: string; state: unknown; summary: unknown }> {
    const keys: string[] = [];
    const found: Array<{ key: string; state: unknown; summary: unknown }> = [];
    const before = canon(unsent);
    try {
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && k.indexOf(unsentPrefix) === 0 && k !== ownKey) keys.push(k);
      }
    } catch {
      // storage may be unavailable
    }
    keys.push(cacheKey);
    for (const key of keys) {
      const e = ls(key) as CacheEntry | null;
      if (!e || e.state === undefined || (key === cacheKey && !e.dirty)) continue;
      addUnsent(e.state, false);
      found.push({ key, state: e.state, summary: e.summary });
    }
    if (canon(unsent) !== before) saveOwn();
    return found;
  }
  // Whether `big` contains `small`: folding small in changes nothing.
  function contains(big: unknown, small: unknown): boolean {
    const c = combine(big, small);
    return c.ok && same(c.value, big);
  }
  // Whether a copy stored on this device contains `s`: the stored known copy, or this
  // instance's own entry. A removal is safe only then (CDS1-018).
  function held(s: unknown): boolean {
    const k = readKnown();
    const own = ls(ownKey) as CacheEntry | null;
    return !!((k && k.state !== undefined && contains(k.state, s)) || (own && own.state !== undefined && contains(own.state, s)));
  }
  // Remove gathered entries the server now holds: `s` (an acknowledged state, or a server copy
  // a read learned) contains an entry's state. Only when a stored copy on this device contains
  // `s` (otherwise a gathered entry may be the device's only copy of that work), and never in
  // safe mode. Each key is re-read just before removal and removed only if it is unchanged.
  // Residual risk: if the owning tab writes new work to its entry between that re-read and the
  // removal, then closes before sending it, that work is lost. Until it closes, the work is in
  // that tab's memory and its entry is rewritten on its next change.
  function cleanup(found: Array<{ key: string; state: unknown; summary: unknown }>, s: unknown) {
    if (!found.length || broken || !held(s)) return;
    for (const f of found) {
      if (broken) return;
      if (!contains(s, f.state)) continue;
      const now = ls(f.key) as CacheEntry | null;
      if (!now || !same(now.state, f.state) || (f.key === cacheKey && !now.dirty)) continue;
      try {
        storage.removeItem(f.key);
      } catch {
        // storage may be unavailable
      }
    }
  }
  // The view to show: `base` folded with the unsent work (which holds other instances' work
  // gathered so far). Callers check `broken` afterwards; in safe mode the result is not used.
  function withUnsent(base: unknown): unknown {
    if (!unsent) return base;
    if (base === null) return copy(unsent);
    const c = combine(base, unsent);
    return c.ok ? c.value : copy(unsent);
  }
  // This device's own copy, never the server's (safe mode): the unsent work, else
  // known.state, else the stored known copy, else the legacy cached state, else {}.
  function localCopy(): unknown {
    if (unsent) return copy(unsent);
    if (known) return copy(known.state);
    const k = (readKnown() || ls(cacheKey)) as CacheEntry | null;
    return k && k.state !== undefined ? k.state : {};
  }
  // After a read. A view that differs from the server copy holds work the server lacks (the
  // unsent work, the `current` given to refresh, or work another writer dropped): it joins
  // `unsent` (CDS1-002, CDS1-007), so it is kept in this instance's own entry and sent again,
  // never mistaken for server data. Then the known copy is updated. Returns false, writing
  // nothing, if folding put the kit in safe mode.
  function afterRead(view: unknown, serverState: unknown, serverSummary: unknown): boolean {
    if (serverState !== undefined && !same(view, serverState)) addUnsent(view, false);
    if (broken) return false;
    // The known copy, also for an absent row ({} at version 0), so a later page pairs from it;
    // written first, since the own entry is removed only once it is stored (CDS1-016).
    const k = known!;
    saveKnown(serverState !== undefined && same(k.state, serverState) ? serverSummary : summaryOf(k.state, serverSummary || {}));
    saveOwn();
    return true;
  }
  /** A row's version; a row without one counts as 1 (the backfill), no row as 0. */
  const versionOf = (row: ProgressRow | null) => (row ? (row.version ?? 1) : 0);
  if (versioned) {
    kit.syncBroken = false;
    kit.deviceId = (() => {
      let d = ls("tskit:device");
      if (typeof d === "string" && d) return d;
      d = Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
      ls("tskit:device", d);
      return d as string;
    })();
  }

  kit.load = (options) =>
    transport
      .getProgress()
      .then((server) => {
        const local = ls(cacheKey) as CacheEntry | null;
        if (versioned) {
          if (broken) return localCopy(); // safe mode: never the server's copy
          const found = gather(); // other instances' unsent work joins
          const sv = versionOf(server);
          const theirs = server ? server.state : {};
          let view: unknown;
          if (known && sv < known.version) {
            // older than what this device already has
            view = withUnsent(known.state);
            return broken ? localCopy() : copy(view);
          }
          if (!learn(theirs, sv)) return localCopy(); // the merge threw: safe mode
          view = withUnsent(known!.state);
          if (broken || !afterRead(view, server ? server.state : undefined, server ? server.summary : {})) return localCopy();
          if (server) cleanup(found, server.state);
          return copy(view);
        }
        if (local && local.dirty) return local.state; // unsent local edit wins until it syncs
        if (server) {
          ls(cacheKey, { state: server.state, summary: server.summary });
          return server.state;
        }
        return local ? local.state : {};
      })
      .catch(() => {
        // Strict: a failed read is "not ready", never the cache or {} (a guess).
        if (options?.strict) throw progressUnavailable();
        const local = ls(cacheKey) as CacheEntry | null;
        if (versioned) {
          seedKnown();
          gather();
          const fb = withUnsent(known ? known.state : local && !local.dirty ? local.state : null);
          if (broken) return localCopy();
          return fb === null ? {} : copy(fb);
        }
        return local ? local.state : {};
      });

  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  let pending: { state: unknown; summary: unknown } | null = null;
  function flushVersioned(p: { state: unknown; summary: unknown }): Promise<SaveResult> {
    inFlight++;
    let state = p.state;
    let summary = p.summary;
    let conflicts = 0;
    let done = false;
    // The class's own summary while the state is what it saved, else one for the new state.
    const summaryFor = (st: unknown) => (same(st, p.state) ? p.summary : summaryOf(st, p.summary));
    // Put the work on the device: this instance's own entry, from memory ("local" when
    // written, else "none"). In safe mode `state` becomes the unsent work.
    function keep(): SaveResult["stored"] {
      if (broken) {
        state = unsent ? copy(unsent) : state;
        summary = summaryFor(state);
      }
      return saveOwn() ? "local" : "none";
    }
    // Every way a save ends reports what the class should show, as `merged` when it differs
    // from what the class saved. After an acknowledgement that is the view `acknowledged`
    // worked out. Otherwise it is memory (which may hold a newer read) folded with this
    // save's state and any unsent work, never an older request-local copy (SYNC-031,
    // SYNC-032), or in safe mode the unsent work; the own entry is rewritten from memory.
    function finish(r: SaveResult): SaveResult {
      if (!done) {
        done = true;
        inFlight--;
      }
      let view = state;
      if (r.stored !== "server") {
        if (known) {
          const ck = combine(known.state, view);
          if (ck.ok) view = ck.value;
        }
        view = withUnsent(view);
        if (broken) view = unsent ? copy(unsent) : state;
        // A successful write means the device holds the work now ("local"), even if an
        // earlier write in this save failed; a failed write keeps what an earlier one achieved.
        if (saveOwn()) r.stored = "local";
      }
      if (!same(view, p.state)) r.merged = copy(view);
      return r;
    }
    // The server stored `state` as `version`.
    function acknowledged(version: number): SaveResult | Promise<SaveResult> {
      learn(state, version);
      // Safe mode: the work stays unsent, nothing is removed and the known copy is not
      // written (FACTORS-CDS1-001); the next page load replays it, harmlessly if it already
      // landed. Checked before anything is gathered (CDS1-011).
      if (broken) return { stored: keep() };
      // Other instances' entries (and a dirty legacy entry) join the unsent work, which is
      // cleared only if the acknowledged state already contains it (CDS1-009); then gathered
      // entries the acknowledged state contains are removed.
      const found = gather();
      if (unsent) {
        const c = combine(state, unsent);
        if (c.ok && same(c.value, state)) unsent = null;
      }
      if (broken) return { stored: keep() };
      // The known copy first: the own entry is removed only once it is stored (CDS1-016); then
      // gathered entries, once one of those stored copies holds the acknowledged state (CDS1-018).
      const k = known!;
      saveKnown(summaryFor(k.state));
      saveOwn();
      cleanup(found, state);
      // Unsent work the acknowledged state does not contain (another instance's, or a newer
      // save's) is sent too before this save reports "server": "server" means the view it
      // reports was itself acknowledged (CDS1-015). It counts against the same cap of
      // conflict rounds; past the cap, or if that send fails, the save reports "local"/"none".
      if (unsent) {
        if (conflicts >= 3) return { stored: keep() };
        conflicts++;
        return attempt();
      }
      // What the class should show now: memory (which may hold a newer read, SYNC-030), never
      // the older request alone (SYNC-031); nothing is unsent here.
      state = copy(k.state);
      summary = summaryFor(state);
      return { stored: "server" };
    }
    function attempt(): Promise<SaveResult> {
      if (broken) return Promise.resolve({ stored: keep() }); // safe mode: send nothing
      // Every send carries all unsent work: this instance's, not only the latest snapshot
      // (CDS1-001, FACTORS-CDS1-002), and other instances' gathered from their entries
      // (CDS1-010, CDS1-014), folded with known.state (pairing).
      gather();
      if (unsent) {
        const u = combine(state, unsent);
        if (u.ok) state = u.value;
      }
      const paired = pair(state);
      if (broken) return Promise.resolve({ stored: keep() });
      state = paired.value;
      summary = summaryFor(state);
      const stored = keep();
      const base = paired.version === null ? -1 : paired.version;
      return transport.saveProgressVersioned({ state, summary, baseVersion: base }).then(
        (r): SaveResult | Promise<SaveResult> => {
          if (r && r.ok) return acknowledged(r.version);
          const conflict = r as Extract<VersionedSaveResult, { ok: false }> | null;
          if (conflicts < 3 && learn(conflict ? conflict.state : {}, conflict ? conflict.version : 0)) {
            conflicts++;
            return attempt();
          }
          // Out of conflict rounds, or safe mode: the own entry is written from memory, paired
          // with what is known now (a load may have advanced known meanwhile).
          const pr = pair(state);
          if (!broken) {
            state = pr.value;
            summary = summaryFor(state);
          }
          return { stored: keep() };
        },
        (): SaveResult => ({ stored }),
      );
    }
    return Promise.resolve()
      .then(attempt)
      .then(finish, () => finish({ stored: keep() }));
  }
  /** Resolves where the pending state ended up, or null when nothing was pending (only init can hit that). */
  function flush(): Promise<SaveResult | null> {
    if (!pending) return Promise.resolve(null);
    const p = pending;
    pending = null;
    if (versioned) return flushVersioned(p);
    // Mirrors the real kit: save_progress drops a save whose rev is older than the stored
    // state's and answers false; that is settled, not dirty, because the server already
    // holds something newer. Only a rejection (network) leaves the cache dirty.
    return transport
      .saveProgress({ state: p.state, summary: p.summary, rev: revOf(p.state) })
      .then((): SaveResult => {
        // The cache must not keep an older dirty snapshot: init replays a dirty cache, and a
        // state without a rev (p_rev 0) would overwrite this acknowledged one (KSO-004). So
        // when the clean write throws, the entry is removed. If removal throws too (storage
        // refusing every operation) a stale entry remains; nothing more can be done here.
        if (!ls(cacheKey, { state: p.state, summary: p.summary })) {
          try {
            storage.removeItem(cacheKey);
          } catch {
            // accepted: see above
          }
        }
        return { stored: "server" };
      }, (): SaveResult => ({ stored: ls(cacheKey, { state: p.state, summary: p.summary, dirty: true }) ? "local" : "none" }));
  }
  kit.save = (state, summary) => {
    let snap: { state: unknown; summary: unknown };
    if (versioned) {
      // Refused before anything is touched (pending work, unsent work, storage) unless the state
      // is a value JSON can carry: undefined would slip through copy() (CDS1-017).
      if (state === undefined) return Promise.resolve({ stored: "none" });
      try {
        snap = { state: copy(state), summary: copy(summary || {}) };
      } catch {
        return Promise.resolve({ stored: "none" });
      }
      if (snap.state === undefined) return Promise.resolve({ stored: "none" });
      lastSave = snap;
      addUnsent(snap.state, true);
      // The own entry holds all of this instance's unsent work, not only this snapshot: a page
      // closed during the debounce is replayed by the next init (CDS1-005).
      saveOwn();
    } else {
      snap = { state, summary: summary ?? {} };
      ls(cacheKey, { state: snap.state, summary: snap.summary, dirty: true });
    }
    pending = snap;
    if (saveTimer) clearTimeout(saveTimer); // the earlier promise is never settled, exactly like the real kit
    return new Promise<SaveResult | undefined>((resolve) => {
      saveTimer = setTimeout(() => {
        // `pending` is always set when this timer fires, so flush never answers null here.
        // flush runs inside a continuation, as in the real kit, so even a synchronous throw
        // settles the promise, as "none".
        Promise.resolve()
          .then(flush)
          .then(
            (r) => resolve(r ?? undefined),
            () => resolve({ stored: "none" }),
          );
      }, 300);
    });
  };

  kit.refresh = (current) => {
    if (!versioned || broken) return Promise.resolve({ changed: false });
    if (pending || inFlight) return Promise.resolve({ changed: false, busy: true });
    let mine: unknown;
    try {
      mine = copy(current);
    } catch {
      return Promise.resolve({ changed: false }); // a bad argument is not a broken merge
    }
    return transport.getProgress().then(
      (server): RefreshResult => {
        if (pending || inFlight) return { changed: false, busy: true };
        if (broken) return { changed: false };
        const sv = versionOf(server);
        const theirs = server ? server.state : {};
        if (known && sv <= known.version) return { changed: false };
        // Work out the new copy and the view first; a throwing merge (safe mode) changes
        // nothing (CDS1-004). `known` is committed before afterRead, which can fail only by
        // entering safe mode, where `known` is never used again.
        const t = known ? combine(known.state, theirs) : { ok: true as const, value: copy(theirs) };
        const c = t.ok ? combine(mine, t.value) : t;
        const view = c.ok ? withUnsent(c.value) : null;
        // `!t.ok` implies `broken` (only a throwing merge fails a fold); it is spelled out for the type.
        if (broken || !t.ok) return { changed: false };
        known = { state: t.value, version: known ? Math.max(known.version, sv) : sv };
        if (!afterRead(view, theirs, server ? server.summary : {})) return { changed: false };
        return { changed: true, state: view };
      },
      (): RefreshResult => ({ changed: false }),
    );
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
  // Queue unsent work and replay it; a failing replay never fails init.
  const local = ls(cacheKey) as CacheEntry | null;
  if (versioned) {
    // Seed `known` from the known copy, then gather every unsent entry: this browser's other
    // instances (closed or still open) and an old kit's dirty edit. Any of it is replayed.
    seedKnown();
    const found = gather();
    if (unsent) pending = { state: copy(unsent), summary: summaryOf(unsent, (found[0] && found[0].summary) || {}) };
  } else if (local && local.dirty) {
    pending = { state: local.state, summary: local.summary };
  }
  await Promise.resolve()
    .then(flush)
    .then(null, () => undefined);
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
    TSKit?: { init(options: { game: string } & SyncOptions): Promise<Kit>; version: number };
    /** The dev kit's transport, so mock-mode e2e can switch saves off and on. Set only by `loadDevKit`. */
    __tsMockTransport?: MemoryTransport;
    /**
     * Shared failure switches every dev-kit transport consults. An e2e init script may set
     * it before the page loads (`{ failReads: true }`); `loadDevKit` creates it empty if absent.
     */
    __tsMockControl?: MockControl;
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
export async function loadRealKit(game: string, sync?: SyncOptions): Promise<Kit> {
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
  return window.TSKit.init({ game, ...sync });
}

/** Dev-mode kit backed by localStorage so saves survive reloads on localhost. `sync` opts in as the real kit's does. */
export async function loadDevKit(game: string, sync?: SyncOptions): Promise<Kit> {
  const storage: StorageLike = typeof window !== "undefined" ? window.localStorage : new MemoryStorage();
  // Reachable only where shouldUseMockKit() is true (localhost, or the env flag outside
  // production builds), never on a deployed class (KSO-005).
  let control: MockControl | undefined;
  if (typeof window !== "undefined") control = window.__tsMockControl ??= {};
  const transport = new MemoryTransport({ storage, key: `wordwave:mock:${game}` }, control);
  if (typeof window !== "undefined") window.__tsMockTransport = transport;
  return createMockKit({ game, userId: "mock-user", displayName: "Dev Learner", storage, transport, ...sync });
}
