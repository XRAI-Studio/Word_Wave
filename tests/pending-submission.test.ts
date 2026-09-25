import { describe, expect, it } from "vitest";
import {
  hasPendingFor,
  PENDING_KEY,
  savePending,
  takePending,
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

describe("pending submission (work order criterion 21, WW-P5-007)", () => {
  it("is returned once to the same learner on the same route and course", () => {
    const s = new Mem();
    savePending(s, p);
    expect(takePending(s, { path: "/lesson/L1", userId: "learner-a", courseCode: "es" })).toEqual(p);
    expect(takePending(s, { path: "/lesson/L1", userId: "learner-a", courseCode: "es" })).toBeNull();
  });

  it("is discarded unsent when another learner signs in on this tab", () => {
    const s = new Mem();
    savePending(s, p);
    expect(takePending(s, { path: "/lesson/L1", userId: "learner-b", courseCode: "es" })).toBeNull();
    expect(s.getItem(PENDING_KEY)).toBeNull();
  });

  it("is discarded unsent when the active course changed", () => {
    const s = new Mem();
    savePending(s, p);
    expect(takePending(s, { path: "/lesson/L1", userId: "learner-a", courseCode: "la" })).toBeNull();
    expect(s.getItem(PENDING_KEY)).toBeNull();
  });

  it("is left alone on a different route", () => {
    const s = new Mem();
    savePending(s, p);
    expect(takePending(s, { path: "/review/session", userId: "learner-a", courseCode: "es" })).toBeNull();
    expect(s.getItem(PENDING_KEY)).not.toBeNull();
  });

  it("survives unreadable storage", () => {
    const s = new Mem();
    s.setItem(PENDING_KEY, "{not json");
    expect(takePending(s, { path: "/lesson/L1", userId: "learner-a", courseCode: "es" })).toBeNull();
  });

  it("reports whether a submission waits for a route without removing it", () => {
    const s = new Mem();
    expect(hasPendingFor(s, "/lesson/L1")).toBe(false);
    savePending(s, p);
    expect(hasPendingFor(s, "/lesson/L1")).toBe(true);
    expect(hasPendingFor(s, "/review/session")).toBe(false);
    expect(s.getItem(PENDING_KEY)).not.toBeNull();
  });
});
