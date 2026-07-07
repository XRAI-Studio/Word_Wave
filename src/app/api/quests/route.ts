import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { todayStr } from "@/lib/gamification";
import { questsForDate } from "@/lib/rewards-defs";
import { LOCAL_USER_ID } from "@/lib/user-service";
import type { QuestDTO } from "@/lib/types";

// Today's three quests with progress (rows created lazily on first read).
export async function GET() {
  const date = todayStr();
  const quests: QuestDTO[] = [];

  for (const def of questsForDate(date)) {
    const row = await db.questProgress.upsert({
      where: { userId_date_questKey: { userId: LOCAL_USER_ID, date, questKey: def.key } },
      update: {},
      create: { userId: LOCAL_USER_ID, date, questKey: def.key },
    });
    quests.push({
      key: def.key,
      title: def.title,
      target: def.target,
      progress: row.progress,
      completed: row.completed,
    });
  }

  return NextResponse.json({ date, quests });
}
