/* End-to-end drive of LingoDuo on http://localhost:3000 (or E2E_BASE)
 * 1. Learn path renders and the active lesson is startable
 * 2. Complete the active lesson making ONE deliberate mistake on the first challenge
 * 3. Assert XP was awarded, streak is alive, a WordReview row was scheduled
 * 4. Backdate the missed words' reviews, run a review session, assert XP increases again
 *
 * NOTE: this drives the real app against the real local DB, so it advances
 * your actual progress and review schedule.
 */
import { chromium, type Page } from "playwright";

const BASE = process.env.E2E_BASE ?? "http://localhost:3000";
const SHOTS = process.env.SHOTS_DIR ?? ".";

// Session cookie of the throwaway user this run registers.
let sessionCookie = "";

type Challenge = {
  id: string;
  type: "MULTIPLE_CHOICE" | "TRANSLATE" | "MATCH" | "FILL_BLANK";
  prompt: string;
  correctAnswer: string;
  meta: {
    choices?: string[];
    wordBank?: string[];
    pairs?: { term: string; translation: string }[];
    wordIds: string[];
  };
};

type UserState = { xp: number; streakCount: number; hearts: number; gems: number; streakFreezes: number };

async function api<T>(path: string): Promise<T> {
  const res = await fetch(BASE + path, { headers: { cookie: sessionCookie } });
  if (!res.ok) throw new Error(`${path} -> ${res.status}`);
  return res.json() as Promise<T>;
}

// Greedy left-to-right reconstruction of the sentence from bank tokens.
function tokenize(answer: string, bank: string[]): string[] {
  const tokens: string[] = [];
  let rest = answer;
  while (rest.length) {
    const hit = [...bank]
      .filter((t) => rest === t || rest.startsWith(t + " "))
      .sort((a, b) => b.length - a.length)[0];
    if (!hit) throw new Error(`Cannot tokenize "${answer}" from [${bank}] at "${rest}"`);
    tokens.push(hit);
    rest = rest.slice(hit.length).trimStart();
  }
  return tokens;
}

async function solveChallenge(page: Page, ch: Challenge, deliberatelyWrong: boolean) {
  await page.getByRole("heading", { name: ch.prompt }).waitFor({ timeout: 5000 });

  if (ch.type === "MULTIPLE_CHOICE") {
    const target = deliberatelyWrong
      ? ch.meta.choices!.find((c) => c !== ch.correctAnswer)!
      : ch.correctAnswer;
    await page.getByRole("radio", { name: new RegExp(`\\d+\\s*${escapeRe(target)}$`) }).click();
    await page.getByRole("button", { name: "Check" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
  } else if (ch.type === "FILL_BLANK") {
    const text = deliberatelyWrong ? "xyz totally wrong" : ch.correctAnswer;
    await page.getByRole("textbox", { name: "Your answer" }).fill(text);
    await page.getByRole("button", { name: "Check" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
  } else if (ch.type === "TRANSLATE") {
    for (const tok of tokenize(ch.correctAnswer, ch.meta.wordBank!)) {
      await page
        .locator(`button:not([disabled])`, { hasText: new RegExp(`^${escapeRe(tok)}$`) })
        .last()
        .click();
    }
    await page.getByRole("button", { name: "Check" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
  } else {
    for (const pair of ch.meta.pairs!) {
      await page.getByRole("button", { name: pair.term, exact: true }).click();
      await page.getByRole("button", { name: pair.translation, exact: true }).click();
    }
    await page.getByRole("button", { name: "Continue" }).click();
  }
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  const browser = await chromium.launch();
  const failures: string[] = [];
  const expect = (cond: boolean, label: string) => {
    console.log(`${cond ? "PASS" : "FAIL"}: ${label}`);
    if (!cond) failures.push(label);
  };

  // --- auth 1. logged-out requests are rejected / redirected
  const anonRes = await fetch(BASE + "/api/user");
  expect(anonRes.status === 401, `anonymous /api/user is 401 (got ${anonRes.status})`);

  const anonContext = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const anonPage = await anonContext.newPage();
  await anonPage.goto(BASE + "/learn");
  await anonPage.waitForURL("**/login", { timeout: 10000 });
  expect(anonPage.url().includes("/login"), "anonymous /learn redirects to /login");
  await anonContext.close();

  // --- auth 2. register a throwaway user and carry its session everywhere
  const email = `e2e-${Date.now()}@example.com`;
  const regRes = await fetch(BASE + "/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "e2e-password", displayName: "E2E Runner" }),
  });
  expect(regRes.ok, `registered throwaway user ${email} (got ${regRes.status})`);
  const setCookie = regRes.headers
    .getSetCookie()
    .find((c) => c.startsWith("lingoduo_session="));
  if (!setCookie) throw new Error("register response did not set a session cookie");
  sessionCookie = setCookie.split(";")[0];
  const sessionToken = sessionCookie.split("=")[1];

  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await context.addCookies([{ name: "lingoduo_session", value: sessionToken, url: BASE }]);
  const page = await context.newPage();

  // --- 0. where are we starting from?
  const before = await api<UserState>("/api/user");
  expect(before.xp === 0, `fresh user starts at 0 XP (got ${before.xp})`);
  const course = await api<{
    activeLessonId: string | null;
    sections: { units: { lessons: { id: string; title: string }[] }[] }[];
  }>("/api/units");
  if (!course.activeLessonId) {
    console.log("Course already complete — nothing to drive. Reseed to rerun.");
    await browser.close();
    return;
  }
  const activeLesson = course.sections
    .flatMap((s) => s.units)
    .flatMap((u) => u.lessons)
    .find((l) => l.id === course.activeLessonId)!;

  // --- 1. learn path
  await page.goto(BASE + "/learn");
  await page.getByText("Start", { exact: true }).waitFor({ timeout: 15000 });
  await page.screenshot({ path: `${SHOTS}/learn.png` });
  const startNode = page.getByRole("button", {
    name: `${activeLesson.title} — start lesson`,
  });
  expect(await startNode.isVisible(), `active lesson "${activeLesson.title}" startable`);

  // --- 2. complete it with one deliberate mistake on the first challenge
  const lesson = await api<{ challenges: Challenge[] }>(`/api/lessons/${activeLesson.id}`);
  await startNode.click();
  await page
    .getByRole("heading", { name: lesson.challenges[0].prompt })
    .waitFor({ timeout: 10000 });
  await page.screenshot({ path: `${SHOTS}/quiz.png` });

  await solveChallenge(page, lesson.challenges[0], true);
  for (const ch of lesson.challenges.slice(1)) await solveChallenge(page, ch, false);
  await solveChallenge(page, lesson.challenges[0], false); // re-queued missed card

  await page.getByText("¡Muy bien!").waitFor({ timeout: 10000 });
  await page.screenshot({ path: `${SHOTS}/result.png` });

  // --- 3. server state moved
  const after = await api<UserState>("/api/user");
  expect(after.xp === before.xp + 20, `lesson XP +20 (${before.xp} -> ${after.xp})`);
  expect(after.streakCount >= 1, `streak alive (got ${after.streakCount})`);
  expect(
    after.hearts === Math.max(0, before.hearts - 1),
    `mistake cost a heart (${before.hearts} -> ${after.hearts})`
  );
  expect(after.gems > before.gems, `lesson gems awarded (${before.gems} -> ${after.gems})`);

  const questsNow = await api<{ quests: { progress: number; completed: boolean }[] }>("/api/quests");
  expect(
    questsNow.quests.some((q) => q.progress > 0 || q.completed),
    "daily quest progress advanced"
  );

  const unitsAfter = await api<{ activeLessonId: string | null }>("/api/units");
  expect(
    unitsAfter.activeLessonId !== activeLesson.id,
    `path advanced past ${activeLesson.id} (now ${unitsAfter.activeLessonId})`
  );

  // --- 4. review flow: backdate only the words missed in this run
  const missedIds = lesson.challenges[0].meta.wordIds;
  const { execSync } = await import("node:child_process");
  const backdateScript =
    "const {PrismaClient}=require('@prisma/client');" +
    "const {PrismaBetterSqlite3}=require('@prisma/adapter-better-sqlite3');" +
    "const f=process.env.DATABASE_PATH?require('path').resolve(process.env.DATABASE_PATH):require('path').join(process.cwd(),'prisma','dev.db');" +
    "const db=new PrismaClient({adapter:new PrismaBetterSqlite3({url:'file:'+f})});" +
    "db.wordReview.updateMany({where:{wordId:{in:JSON.parse(process.env.MISSED_IDS)}},data:{dueAt:new Date(Date.now()-1000)}})" +
    ".then(r=>{console.log(r.count);return db.$disconnect()})";
  const backdated = execSync(`npx tsx -e "${backdateScript}"`, {
    cwd: process.cwd(),
    encoding: "utf8",
    env: { ...process.env, MISSED_IDS: JSON.stringify(missedIds) },
  }).trim();
  expect(Number(backdated) >= 1, `WordReview scheduled for missed word (got ${backdated})`);

  const review = await api<{ challenges: Challenge[] }>("/api/review");
  await page.goto(BASE + "/review");
  await page.getByText(/due for review/).waitFor({ timeout: 10000 });
  await page.screenshot({ path: `${SHOTS}/review.png` });
  await page.getByRole("button", { name: "Start review" }).click();

  await page
    .getByRole("heading", { name: review.challenges[0].prompt })
    .waitFor({ timeout: 10000 });
  for (const ch of review.challenges) await solveChallenge(page, ch, false);
  await page.getByText("¡Muy bien!").waitFor({ timeout: 10000 });

  const final = await api<UserState>("/api/user");
  expect(final.xp > after.xp, `review XP awarded (${after.xp} -> ${final.xp})`);
  expect(final.gems > after.gems, `review gems awarded (${after.gems} -> ${final.gems})`);
  expect(final.hearts === after.hearts, `review costs no hearts (still ${final.hearts})`);

  // --- 4b. streak-freeze shop honors its contract either way
  const shopRes = await fetch(BASE + "/api/shop/streak-freeze", {
    method: "POST",
    headers: { cookie: sessionCookie },
  });
  const shopBody = (await shopRes.json()) as { streakFreezes?: number; error?: string };
  if (shopRes.ok) {
    expect(
      (shopBody.streakFreezes ?? 0) === final.streakFreezes + 1,
      `streak freeze purchased (${final.streakFreezes} -> ${shopBody.streakFreezes})`
    );
  } else {
    expect(
      shopRes.status === 400 && typeof shopBody.error === "string",
      `streak freeze purchase rejected cleanly (${shopRes.status}: ${shopBody.error})`
    );
  }

  // --- 5. Level 3 lesson: typed answers (FILL_BLANK) end-to-end
  const fullCourse = await api<{
    sections: { title: string; units: { lessons: { id: string }[] }[] }[];
  }>("/api/units");
  const l3Section = fullCourse.sections.find((s) => s.title.includes("Level 3"));
  if (!l3Section) {
    expect(false, "a Level 3 section exists");
  } else {
    const l3LessonId = l3Section.units[0].lessons[0].id;
    const l3Lesson = await api<{ challenges: Challenge[] }>(`/api/lessons/${l3LessonId}`);
    expect(
      l3Lesson.challenges.some((c) => c.type === "FILL_BLANK") &&
        l3Lesson.challenges.every((c) => c.type !== "MULTIPLE_CHOICE"),
      "L3 lesson uses FILL_BLANK instead of MULTIPLE_CHOICE"
    );

    await page.goto(`${BASE}/lesson/${l3LessonId}`);
    await page
      .getByRole("heading", { name: l3Lesson.challenges[0].prompt })
      .waitFor({ timeout: 10000 });
    await page.screenshot({ path: `${SHOTS}/fill-blank.png` });
    for (const ch of l3Lesson.challenges) await solveChallenge(page, ch, false);
    await page.getByText("¡Muy bien!").waitFor({ timeout: 10000 });

    const afterL3 = await api<UserState>("/api/user");
    expect(afterL3.xp > final.xp, `L3 lesson XP awarded (${final.xp} -> ${afterL3.xp})`);
  }

  // --- 6. phone viewport: bottom tab bar navigates the app
  const mobileContext = await browser.newContext({ viewport: { width: 360, height: 800 } });
  await mobileContext.addCookies([{ name: "lingoduo_session", value: sessionToken, url: BASE }]);
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(BASE + "/learn");
  await mobilePage.getByText("Daily quests").waitFor({ timeout: 15000 });
  const bottomNav = mobilePage.getByRole("navigation", { name: "Primary" });
  expect(await bottomNav.isVisible(), "mobile bottom nav visible at 360px");
  await mobilePage.screenshot({ path: `${SHOTS}/mobile-learn.png` });
  await bottomNav.getByRole("link", { name: "Profile" }).click();
  await mobilePage.getByText("E2E Runner").waitFor({ timeout: 10000 });
  expect(true, "mobile profile shows the logged-in user");
  await mobilePage.screenshot({ path: `${SHOTS}/mobile-profile.png` });
  await mobileContext.close();

  await browser.close();
  if (failures.length) {
    console.error(`\n${failures.length} FAILURE(S)`);
    process.exit(1);
  }
  console.log("\nALL E2E CHECKS PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
