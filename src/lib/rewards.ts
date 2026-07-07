import { db } from "@/lib/db";
import {
  GEMS_PER_LESSON,
  GEMS_PERFECT_BONUS,
  GEMS_PER_QUEST,
  GEMS_PER_REVIEW,
  GEMS_STREAK_MILESTONE,
  STREAK_MILESTONE_DAYS,
  todayStr,
} from "@/lib/gamification";
import { ACHIEVEMENTS, questsForDate, type QuestKind } from "@/lib/rewards-defs";
import { LOCAL_USER_ID } from "@/lib/user-service";

export interface QuestCompleted {
  key: string;
  title: string;
  gems: number;
}

export interface AchievementUnlocked {
  key: string;
  title: string;
  description: string;
}

// Check every achievement against the user's current stats and persist any
// new unlocks. Shared by completion routes and the shop.
export async function checkAchievements(): Promise<AchievementUnlocked[]> {
  const user = await db.user.findUniqueOrThrow({ where: { id: LOCAL_USER_ID } });
  const owned = new Set(
    (await db.achievement.findMany({ where: { userId: LOCAL_USER_ID } })).map((a) => a.key)
  );
  const unlocked: AchievementUnlocked[] = [];
  for (const def of ACHIEVEMENTS) {
    if (owned.has(def.key) || !def.test(user)) continue;
    await db.achievement.create({ data: { userId: LOCAL_USER_ID, key: def.key } });
    unlocked.push({ key: def.key, title: def.title, description: def.description });
  }
  return unlocked;
}

// Applied after XP/streak have been written by the completion route.
// Increments lifetime counters, advances today's quests, awards gems
// (activity + quest + streak-milestone), and checks achievements.
export async function applyCompletionRewards(opts: {
  kind: "lesson" | "review";
  xpEarned: number;
  perfect: boolean;
  wordsReviewed: number;
  streakCount: number;
  firstActivityToday: boolean;
  now: Date;
}): Promise<{
  gemsEarned: number;
  questsCompleted: QuestCompleted[];
  achievementsUnlocked: AchievementUnlocked[];
}> {
  const { kind, xpEarned, perfect, wordsReviewed, streakCount, firstActivityToday, now } = opts;

  let gemsEarned =
    kind === "lesson" ? GEMS_PER_LESSON + (perfect ? GEMS_PERFECT_BONUS : 0) : GEMS_PER_REVIEW;

  if (firstActivityToday && streakCount > 0 && streakCount % STREAK_MILESTONE_DAYS === 0) {
    gemsEarned += GEMS_STREAK_MILESTONE;
  }

  // Advance today's quests.
  const date = todayStr(now);
  const increments: Record<QuestKind, number> = {
    xp: xpEarned,
    lessons: kind === "lesson" ? 1 : 0,
    perfect: kind === "lesson" && perfect ? 1 : 0,
    "review-words": wordsReviewed,
    "review-sessions": kind === "review" ? 1 : 0,
  };

  const questsCompleted: QuestCompleted[] = [];
  for (const quest of questsForDate(date)) {
    const inc = increments[quest.kind];
    if (inc <= 0) continue;
    const row = await db.questProgress.upsert({
      where: { userId_date_questKey: { userId: LOCAL_USER_ID, date, questKey: quest.key } },
      update: {},
      create: { userId: LOCAL_USER_ID, date, questKey: quest.key },
    });
    if (row.completed) continue;
    const progress = Math.min(quest.target, row.progress + inc);
    const completed = progress >= quest.target;
    await db.questProgress.update({
      where: { id: row.id },
      data: { progress, completed },
    });
    if (completed) {
      gemsEarned += GEMS_PER_QUEST;
      questsCompleted.push({ key: quest.key, title: quest.title, gems: GEMS_PER_QUEST });
    }
  }

  await db.user.update({
    where: { id: LOCAL_USER_ID },
    data: {
      gems: { increment: gemsEarned },
      ...(kind === "lesson" ? { lessonsCompleted: { increment: 1 } } : {}),
      ...(kind === "lesson" && perfect ? { perfectLessons: { increment: 1 } } : {}),
      ...(kind === "review" ? { reviewsCompleted: { increment: 1 } } : {}),
    },
  });

  const achievementsUnlocked = await checkAchievements();
  return { gemsEarned, questsCompleted, achievementsUnlocked };
}
