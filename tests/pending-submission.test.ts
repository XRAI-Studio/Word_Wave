import { describe, expect, it } from "vitest";
import {
  belongsTo,
  clearPending,
  hasPendingFor,
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
