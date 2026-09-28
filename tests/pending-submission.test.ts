import { describe, expect, it } from "vitest";
import {
  belongsTo,
  clearPending,
  clearPendingFor,
  hasPendingFor,
  keepPending,
  peekPending,
  PENDING_KEY,
  savePending,
  type PendingSubmission,
  type StorageLike,
} from "@/lib/pending-submission";

class Mem implements StorageLike {
  m = new Map<string, string>();
  getItem(k: string) {
    return this.m.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

const p: PendingSubmission = {
  path: "/lesson/L1",
  url: "/api/lessons/L1/complete",
  body: { failedWordIds: ["w1"], correctWordIds: [], mistakes: 1 },
  userId: "learner-a",
  courseCode: "es",
  accuracy: 0.8,
};

describe("pending submission (work order criterion 21)", () => {
  it("stays stored when read, until it is cleared (WW-P5-R2-001)", () => {
    const s = new Mem();
    savePending(s, p);
    expect(peekPending(s, "/lesson/L1")).toEqual(p);
    expect(peekPending(s, "/lesson/L1")).toEqual(p);
    clearPending(s, "/lesson/L1");
    expect(peekPending(s, "/lesson/L1")).toBeNull();
    expect(s.getItem(PENDING_KEY)).toBeNull();
  });

  it("is neither returned nor cleared for a different route", () => {
    const s = new Mem();
    savePending(s, p);
    expect(peekPending(s, "/review/session")).toBeNull();
    clearPending(s, "/review/session");
    expect(s.getItem(PENDING_KEY)).not.toBeNull();
  });

  it("says whether it was stored (the leave guard stays on when not, HR-004)", () => {
    expect(savePending(new Mem(), p)).toBe(true);
    const full = {
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => {},
    };
    expect(savePending(full, p)).toBe(false);
  });

  it("reports whether a submission waits for a route", () => {
    const s = new Mem();
    expect(hasPendingFor(s, "/lesson/L1")).toBe(false);
    savePending(s, p);
    expect(hasPendingFor(s, "/lesson/L1")).toBe(true);
    expect(hasPendingFor(s, "/review/session")).toBe(false);
  });

  it("belongs only to the same learner and active course (WW-P5-007)", () => {
    expect(belongsTo(p, { userId: "learner-a", courseCode: "es" })).toBe(true);
    expect(belongsTo(p, { userId: "learner-b", courseCode: "es" })).toBe(false);
    expect(belongsTo(p, { userId: "learner-a", courseCode: "la" })).toBe(false);
    expect(belongsTo(p, { userId: "learner-a", courseCode: null })).toBe(false);
  });

  it("survives unreadable storage", () => {
    const s = new Mem();
    s.setItem(PENDING_KEY, "{not json");
    expect(peekPending(s, "/lesson/L1")).toBeNull();
    expect(hasPendingFor(s, "/lesson/L1")).toBe(false);
  });
});

describe("an ordinary quiz's own copy (WW-P5-R5-003, WW-P5-R6-001)", () => {
  const quiz = (path: string, submissionId: string): PendingSubmission => ({ ...p, path, body: { ...(p.body as object), submissionId } });
  const a = quiz("/lesson/A", "id-a");
  const b = quiz("/lesson/B", "id-b");

  it("is kept when nothing else waits, and again on a retry of the same quiz", () => {
    const s = new Mem();
    expect(keepPending(s, a)).toBe(true);
    expect(keepPending(s, { ...a, accuracy: 0.5 })).toBe(true);
    expect(peekPending(s, "/lesson/A")).toEqual({ ...a, accuracy: 0.5 });
  });

  it("never overwrites another quiz's kept submission", () => {
    const s = new Mem();
    savePending(s, a);
    expect(keepPending(s, b)).toBe(false);
    expect(keepPending(s, quiz("/lesson/A", "id-other"))).toBe(false);
    expect(peekPending(s, "/lesson/A")).toEqual(a);
  });

  it("is cleared only when the stored one is this very quiz", () => {
    const s = new Mem();
    savePending(s, a);
    clearPendingFor(s, b);
    clearPendingFor(s, quiz("/lesson/A", "id-other"));
    expect(peekPending(s, "/lesson/A")).toEqual(a);
    clearPendingFor(s, a);
    expect(s.getItem(PENDING_KEY)).toBeNull();
  });

  it("a body without an id never matches (nothing is overwritten or cleared)", () => {
    const s = new Mem();
    savePending(s, p);
    expect(keepPending(s, p)).toBe(false);
    clearPendingFor(s, p);
    expect(peekPending(s, p.path)).toEqual(p);
  });
});
