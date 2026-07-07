// Pure quest & achievement definitions — safe to import from client code.

export type QuestKind = "xp" | "lessons" | "perfect" | "review-words" | "review-sessions";

export interface QuestDef {
  key: string;
  title: string;
  target: number;
  kind: QuestKind;
}

export const QUEST_POOL: QuestDef[] = [
  { key: "earn-40-xp", title: "Earn 40 XP", target: 40, kind: "xp" },
  { key: "complete-3-lessons", title: "Complete 3 lessons", target: 3, kind: "lessons" },
  { key: "perfect-1-lesson", title: "Get a perfect lesson", target: 1, kind: "perfect" },
  { key: "review-5-words", title: "Review 5 words", target: 5, kind: "review-words" },
  { key: "complete-1-review", title: "Complete a review session", target: 1, kind: "review-sessions" },
];

// 3 quests per day, rotating deterministically with the date.
export function questsForDate(dateStr: string): QuestDef[] {
  let hash = 0;
  for (const ch of dateStr) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const start = hash % QUEST_POOL.length;
  return [0, 1, 2].map((i) => QUEST_POOL[(start + i) % QUEST_POOL.length]);
}

export interface AchievementStats {
  xp: number;
  streakCount: number;
  lessonsCompleted: number;
  perfectLessons: number;
  reviewsCompleted: number;
  streakFreezes: number;
}

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  test: (s: AchievementStats) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { key: "streak-7", title: "Week One", description: "Reach a 7-day streak", test: (s) => s.streakCount >= 7 },
  { key: "streak-30", title: "Monthly Habit", description: "Reach a 30-day streak", test: (s) => s.streakCount >= 30 },
  { key: "streak-100", title: "Century Flame", description: "Reach a 100-day streak", test: (s) => s.streakCount >= 100 },
  { key: "xp-500", title: "Spark", description: "Earn 500 XP", test: (s) => s.xp >= 500 },
  { key: "xp-2500", title: "Livewire", description: "Earn 2,500 XP", test: (s) => s.xp >= 2500 },
  { key: "xp-10000", title: "Powerhouse", description: "Earn 10,000 XP", test: (s) => s.xp >= 10000 },
  { key: "lessons-10", title: "First Steps", description: "Complete 10 lessons", test: (s) => s.lessonsCompleted >= 10 },
  { key: "lessons-50", title: "Scholar", description: "Complete 50 lessons", test: (s) => s.lessonsCompleted >= 50 },
  { key: "lessons-150", title: "Grand Scholar", description: "Complete 150 lessons", test: (s) => s.lessonsCompleted >= 150 },
  { key: "perfect-5", title: "Flawless Five", description: "Finish 5 perfect lessons", test: (s) => s.perfectLessons >= 5 },
  { key: "perfect-25", title: "Perfectionist", description: "Finish 25 perfect lessons", test: (s) => s.perfectLessons >= 25 },
  { key: "reviews-10", title: "Memory Keeper", description: "Complete 10 review sessions", test: (s) => s.reviewsCompleted >= 10 },
  { key: "reviews-50", title: "Iron Memory", description: "Complete 50 review sessions", test: (s) => s.reviewsCompleted >= 50 },
  { key: "freeze-1", title: "Safety Net", description: "Own a streak freeze", test: (s) => s.streakFreezes >= 1 },
];
