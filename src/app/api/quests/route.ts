import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { todayStr } from "@/lib/gamification";
import { questsForDate } from "@/lib/rewards-defs";
import type { QuestDTO } from "@/lib/types";

// Today's three quests with progress (rows created lazily on first read).
export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  const userId = sessionUser.id;

  const date = todayStr();
  const quests: QuestDTO[] = [];

  for (const def of questsForDate(date)) {
    const row = await db.questProgress.upsert({
      where: { userId_date_questKey: { userId, date, questKey: def.key } },
      update: {},
      create: { userId, date, questKey: def.key },
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
