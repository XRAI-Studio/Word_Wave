// SM-2-lite spaced repetition scheduling.
// interval is in days; 0 means "relearning" (due again in hours, not days).

export const RELEARN_DELAY_MS = 4 * 60 * 60 * 1000; // 4 hours
export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;

export interface SrsState {
  interval: number;
  easeFactor: number;
  lapses: number;
}

export interface SrsResult extends SrsState {
  dueAt: Date;
  lastResult: "correct" | "wrong";
}

export function scheduleNext(state: SrsState, correct: boolean, now = new Date()): SrsResult {
  if (correct) {
    const interval = Math.max(1, Math.round(state.interval * state.easeFactor));
    return {
      interval,
      easeFactor: Math.min(MAX_EASE, state.easeFactor + 0.1),
      lapses: state.lapses,
      dueAt: new Date(now.getTime() + interval * 24 * 60 * 60 * 1000),
      lastResult: "correct",
    };
  }
  return {
    interval: 0,
    easeFactor: Math.max(MIN_EASE, state.easeFactor - 0.2),
    lapses: state.lapses + 1,
    dueAt: new Date(now.getTime() + RELEARN_DELAY_MS),
    lastResult: "wrong",
  };
}

// Initial state for a word that was just failed inside a lesson.
export function initialFailedState(now = new Date()): SrsResult {
  return {
    interval: 0,
    easeFactor: 2.5,
    lapses: 1,
    dueAt: new Date(now.getTime() + RELEARN_DELAY_MS),
    lastResult: "wrong",
  };
}
