/* End-to-end checks for Word Wave on the class standard (work order criterion 28).
 *
 * Part (a), production mode (`next build` + `next start`, no cookie): the page gate
 * redirects to the portal login, API routes answer JSON 401, the old scottmacscott.com
 * host is redirected, the four security headers are present, assets load, repository
 * files are not served.
 *
 * Part (b), development with the mock kit, session and portal (NEXT_PUBLIC_TS_KIT=mock):
 * the full learner flow against the local Postgres (`npm run db:dev`):
 * course pick, a lesson with one mistake, the replay, a concurrent double completion,
 * a review session, the HUD across navigation and reload, the launcher summary across a
 * course switch, direct loads of both quiz routes, the expired-session round trip
 * with the pending submission, and "Return to Home Room" with the leave guard (a quiz is
 * its own document; unsaved answers raise the in-page dialog or the browser's prompt).
 *
 * It resets the mock learner's rows first; it never touches production.
 */
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import http from "node:http";
import net from "node:net";
import { chromium, type Dialog, type Page, type Route } from "playwright";
import { createDbClient } from "../src/lib/db";

try {
  process.loadEnvFile(".env");
} catch {}

const PORTAL_LOGIN = "https://class.travelschooling.com/login?next=";
const HEADERS = {
  "x-content-type-options": "nosniff",
  "referrer-policy": "strict-origin-when-cross-origin",
  "x-frame-options": "DENY",
  "permissions-policy": "camera=(), microphone=(), geolocation=()",
};
const MOCK_USER = "mock-user";
/** The portal's Home Room (home-room plan); the context routes it to a local stub. */
const HOME = "https://class.travelschooling.com/";
const failures: string[] = [];

function check(cond: boolean, label: string) {
  console.log(`${cond ? "PASS" : "FAIL"}: ${label}`);
  if (!cond) failures.push(label);
}
const log = (m: string) => console.log(`\n== ${m}`);

// ---------------------------------------------------------------- servers

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, () => {
      const { port } = srv.address() as net.AddressInfo;
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

async function waitForServer(base: string, timeoutMs: number) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(base + "/favicon.ico", { redirect: "manual" });
      if (res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 750));
  }
  throw new Error(`server at ${base} did not start`);
}

function startNext(args: string[], env: Record<string, string>): ChildProcess {
  const child = spawn("npx", ["next", ...args], {
    env: { ...process.env, BROWSER: "none", ...env },
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (d) => process.env.E2E_VERBOSE && process.stdout.write(String(d)));
  child.stderr?.on("data", (d) => process.env.E2E_VERBOSE && process.stderr.write(String(d)));
  return child;
}

/** PIDs listening on a port. `npx next` re-spawns the real server, so the shell's PID tree is not enough. */
function listenersOnPort(port: number): number[] {
  try {
    if (process.platform === "win32") {
      const out = execFileSync("netstat", ["-ano", "-p", "tcp"], { encoding: "utf8" });
      return [
        ...new Set(
          out
            .split(/\r?\n/)
            .filter((l) => l.includes(`:${port} `) && l.includes("LISTENING"))
            .map((l) => Number(l.trim().split(/\s+/).pop()))
        ),
      ].filter((n) => n > 0);
    }
    const out = execFileSync("lsof", ["-t", `-iTCP:${port}`, "-sTCP:LISTEN"], { encoding: "utf8" });
    return out.split(/\s+/).map(Number).filter((n) => n > 0);
  } catch {
    return [];
  }
}

function killPid(pid: number) {
  try {
    if (process.platform === "win32") execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    else process.kill(pid, "SIGTERM");
  } catch {
    // already gone
  }
}

function stopServer(child: ChildProcess, port: number) {
  if (child.pid) killPid(child.pid);
  for (const pid of listenersOnPort(port)) killPid(pid);
}

/** A GET with an explicit Host header (fetch does not allow setting Host). */
function getWithHost(port: number, path: string, host: string): Promise<{ status: number; location?: string }> {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: "localhost", port, path, headers: { host } }, (res) => {
      res.resume();
      resolve({ status: res.statusCode ?? 0, location: res.headers.location });
    });
    req.on("error", reject);
    req.end();
  });
}

// ---------------------------------------------------------------- part (a)

async function gateInProductionMode() {
  log("part (a): production gate");
  const port = await freePort();
  const base = `http://localhost:${port}`;
  // Explicit values win over `.env`: no mock flag, no database, real Supabase URL.
  const env = {
    NODE_ENV: "production",
    NEXT_PUBLIC_SUPABASE_URL: "https://qywcmcgxgitovswbzets.supabase.co",
    NEXT_PUBLIC_TS_KIT: "",
    DATABASE_URL: "",
  } as const;
  const stdio: "inherit" | "ignore" = process.env.E2E_VERBOSE ? "inherit" : "ignore";
  execFileSync("npx", ["next", "build"], { env: { ...process.env, ...env }, shell: true, stdio });
  const server = startNext(["start", "--hostname", "localhost", "--port", String(port)], env);
  try {
    await waitForServer(base, 90_000);
    const get = (p: string) => fetch(base + p, { redirect: "manual" });

    for (const p of ["/", "/learn", "/lesson/abc", "/review/session", "/welcome"]) {
      const res = await get(p);
      check(res.status === 307, `GET ${p} without a cookie is 307 (got ${res.status})`);
      check(
        res.headers.get("location") === PORTAL_LOGIN + encodeURIComponent(`${base}${p}`),
        `GET ${p} redirects to the portal login with next (got ${res.headers.get("location")})`
      );
    }
    const learn = await get("/learn");
    for (const [k, v] of Object.entries(HEADERS)) {
      check(learn.headers.get(k) === v, `header ${k} on /learn (got ${learn.headers.get(k)})`);
    }

    const api = await get("/api/user");
    check(api.status === 401, `GET /api/user without a cookie is 401 (got ${api.status})`);
    check(
      (api.headers.get("content-type") ?? "").includes("application/json"),
      "API 401 is JSON, not a redirect"
    );

    for (const host of ["scottmacscott.com", "www.scottmacscott.com"]) {
      const old = await getWithHost(port, "/learn?x=1", host);
      check(old.status === 308, `Host ${host} is redirected permanently (got ${old.status})`);
      check(
        old.location === "https://wordwave.travelschooling.com/learn?x=1",
        `Host ${host} lands on the new host with path and query (got ${old.location})`
      );
    }

    const icon = await get("/icon-192.png");
    check(icon.status === 200, `static asset /icon-192.png is 200 (got ${icon.status})`);
    const manifest = await get("/manifest.webmanifest");
    check(manifest.status === 307, `the manifest is behind the gate (got ${manifest.status})`);
    for (const p of ["/prisma/schema.prisma", "/docs/plans/2026-09-25-class-standard-phase5.md", "/PLAN.md", "/.env"]) {
      const res = await get(p);
      const body = res.status === 200 ? await res.text() : "";
      check(res.status !== 200 && !body.includes("datasource"), `${p} is not served (got ${res.status})`);
    }
  } finally {
    stopServer(server, port);
  }
}

// ---------------------------------------------------------------- part (b)

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
type Award = { status: string; result: { awarded_xp: number; xp: number; gems: number } | null };
type UserBody = {
  lessonsCompleted: number;
  devTotals?: { xp: number; gems: number };
  devSummary?: { rev: number; summary: { headline: string; percent: number } } | null;
};
type Units = {
  activeLessonId: string | null;
  course: { code: string };
  sections: { fillBlank: boolean; units: { lessons: { id: string; title: string }[] }[] }[];
};

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

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function solveChallenge(page: Page, ch: Challenge, deliberatelyWrong: boolean) {
  await page.getByRole("heading", { name: ch.prompt }).waitFor({ timeout: 10_000 });
  if (ch.type === "MULTIPLE_CHOICE") {
    const target = deliberatelyWrong ? ch.meta.choices!.find((c) => c !== ch.correctAnswer)! : ch.correctAnswer;
    await page.getByRole("radio", { name: new RegExp(`\\d+\\s*${escapeRe(target)}$`) }).click();
    await page.getByRole("button", { name: "Check" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
  } else if (ch.type === "FILL_BLANK") {
    await page.getByRole("textbox", { name: "Your answer" }).fill(deliberatelyWrong ? "xyz totally wrong" : ch.correctAnswer);
    await page.getByRole("button", { name: "Check" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
  } else if (ch.type === "TRANSLATE") {
    for (const tok of tokenize(ch.correctAnswer, ch.meta.wordBank!)) {
      await page.locator(`button:not([disabled])`, { hasText: new RegExp(`^${escapeRe(tok)}$`) }).last().click();
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

/** Plays a whole lesson; with `mistake`, the first challenge is answered wrong once and re-queued. */
async function playLesson(page: Page, challenges: Challenge[], mistake: boolean) {
  if (mistake) {
    await solveChallenge(page, challenges[0], true);
    for (const ch of challenges.slice(1)) await solveChallenge(page, ch, false);
    await solveChallenge(page, challenges[0], false);
  } else {
    for (const ch of challenges) await solveChallenge(page, ch, false);
  }
}

async function resultStatus(page: Page): Promise<string | null> {
  await page.getByRole("button", { name: "Back to the path" }).waitFor({ timeout: 20_000 });
  const msg = page.getByTestId("award-message");
  return (await msg.count()) ? msg.getAttribute("data-status") : null;
}

async function hudXp(page: Page): Promise<number> {
  const el = page.locator('[title="Total XP"]');
  try {
    await el.waitFor({ timeout: 60_000 });
  } catch (err) {
    console.error("HUD not visible; page text:", (await page.locator("body").innerText()).slice(0, 400));
    throw err;
  }
  await page.waitForFunction(() => {
    const hud = document.querySelector('[title="Total XP"]')?.parentElement;
    return hud && getComputedStyle(hud).opacity === "1";
  });
  return Number((await el.innerText()).replace(/\D+/g, ""));
}

async function hudGems(page: Page): Promise<number> {
  return Number((await page.locator('[title="Gems"]').innerText()).replace(/\D+/g, ""));
}

/**
 * Starts a departure and answers the browser's `beforeunload` prompt if one appears.
 * Returns the dialog type seen (`beforeunload`), or null when none came within 5 s. The
 * listener is removed afterwards: a leftover one would swallow the next dialog, and with
 * none Playwright dismisses dialogs itself (which cancels the navigation).
 */
async function answerLeavePrompt(page: Page, action: "accept" | "dismiss", trigger: () => Promise<unknown>) {
  let seen: string | null = null;
  let handled!: () => void;
  const done = new Promise<void>((r) => (handled = r));
  const onDialog = async (d: Dialog) => {
    seen = d.type();
    await (action === "accept" ? d.accept() : d.dismiss()).catch(() => {});
    handled();
  };
  page.on("dialog", onDialog);
  try {
    await trigger();
    await Promise.race([done, new Promise((r) => setTimeout(r, 5000))]);
  } finally {
    page.off("dialog", onDialog);
  }
  return seen as string | null;
}

/** History steps from inside the page, so a cancelled departure never hangs a Playwright call. */
const historyStep = (page: Page, dir: "back" | "forward") =>
  page.evaluate((d) => {
    setTimeout(() => (d === "back" ? history.back() : history.forward()), 0);
  }, dir);

async function learnerFlowInDevMode() {
  log("part (b): learner flow on the dev mock");
  if (!process.env.DATABASE_URL?.includes("localhost")) {
    throw new Error("part (b) needs DATABASE_URL pointing at the local `npm run db:dev` database");
  }
  const db = createDbClient(process.env.DATABASE_URL, 2);
  await db.user.deleteMany({ where: { id: MOCK_USER } }); // cascades progress and reviews

  // Start `next dev` without Turbopack's dev filesystem cache (on by default since Next
  // 16.1). A cache left poisoned by an earlier dev session (every run ends by force-killing
  // its server) made the root layout's next/font/google CSS fail to resolve ("queries
  // have exactly one entry"), so every page answered 500 on any commit. Only the cache
  // directory goes; `.next/dev/node_modules` holds junctions into node_modules.
  rmSync(".next/dev/cache/turbopack", { recursive: true, force: true });

  const port = await freePort();
  const base = `http://localhost:${port}`;
  const server = startNext(["dev", "--hostname", "localhost", "--port", String(port)], {
    NEXT_PUBLIC_TS_KIT: "mock",
    NEXT_PUBLIC_SUPABASE_URL: "https://qywcmcgxgitovswbzets.supabase.co",
  });
  const browser = await chromium.launch();
  try {
    await waitForServer(base, 120_000);
    const json = async <T>(p: string, init?: RequestInit): Promise<T> => {
      const res = await fetch(base + p, init);
      if (!res.ok) throw new Error(`${p} -> ${res.status}`);
      return res.json() as Promise<T>;
    };
    const post = <T>(p: string, body: unknown, headers: Record<string, string> = {}) =>
      json<T>(p, { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });

    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const homeRoom = () => page.getByRole("button", { name: "Return to Home Room", exact: true });
    // The expired-session step navigates to the portal; answer it locally, never the real one.
    await context.route("https://class.travelschooling.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/html", body: "<title>portal stub</title>portal" })
    );

    // --- course pick
    const noCourse = await fetch(base + "/api/units");
    check(noCourse.status === 409, `units gated before a course is picked (got ${noCourse.status})`);
    await page.goto(base + "/learn");
    await page.waitForURL("**/welcome", { timeout: 60_000 });
    check(true, "a new learner lands on the course picker");
    await homeRoom().waitFor({ timeout: 60_000 });
    check((await homeRoom().count()) === 1, "the course picker has a Return to Home Room button");
    const html = await (await fetch(base + "/welcome")).text();
    check(
      /<link rel="manifest" href="\/manifest.webmanifest" crossorigin="use-credentials"\/?>/.test(html),
      "the manifest link carries crossorigin=use-credentials"
    );
    await page.getByRole("button", { name: /Spanish/ }).click();
    await page.waitForURL("**/learn", { timeout: 30_000 });
    check((await hudXp(page)) === 0, "HUD starts at 0 XP");

    // --- first lesson with one mistake
    const units = await json<Units>("/api/units");
    const lessons = units.sections.flatMap((s) => s.units).flatMap((u) => u.lessons);
    const first = lessons.find((l) => l.id === units.activeLessonId)!;
    const firstLesson = await json<{ challenges: Challenge[] }>(`/api/lessons/${first.id}`);
    await page.getByRole("button", { name: `${first.title} — start lesson` }).click();
    // A lesson is a full document load now (home-room plan); the first compile in dev is slow.
    await page.getByRole("heading", { name: firstLesson.challenges[0].prompt }).waitFor({ timeout: 60_000 });
    await playLesson(page, firstLesson.challenges, true);
    check((await resultStatus(page)) === "awarded", "first completion: award status awarded");
    check((await page.getByTestId("xp-earned").innerText()) === "10", "result screen shows 10 XP earned");

    const progress = await db.lessonProgress.findMany({ where: { userId: MOCK_USER } });
    check(progress.length === 1 && progress[0].lessonId === first.id, "one LessonProgress row");
    const missed = await db.wordReview.findMany({ where: { userId: MOCK_USER } });
    check(missed.length >= 1, `the missed word entered review (${missed.length} WordReview rows)`);

    await page.getByRole("button", { name: "Back to the path" }).click();
    await page.waitForURL("**/learn");
    check((await hudXp(page)) === 10, "HUD shows 10 XP after returning to the path");
    check((await hudGems(page)) === 5, "HUD shows the first-lesson achievement's 5 gems without a reload");
    await page.reload();
    check((await hudXp(page)) === 10, "HUD still shows 10 XP after a reload");

    let me = await json<UserBody>("/api/user");
    const revAfterFirst = me.devSummary?.rev ?? 0;
    check(me.devSummary?.summary.headline === "1 lesson done in Spanish", `launcher headline (got ${me.devSummary?.summary.headline})`);

    // --- replay by direct load: no second award
    await page.goto(`${base}/lesson/${first.id}`);
    await playLesson(page, firstLesson.challenges, false);
    check((await resultStatus(page)) === "skipped", "replay: award status skipped");
    check((await page.getByTestId("award-message").innerText()).includes("Already completed"), "replay says already completed");
    me = await json<UserBody>("/api/user");
    check(me.devTotals?.xp === 10, `replay awarded nothing (xp ${me.devTotals?.xp})`);

    // --- direct loads and reloads of both quiz routes
    await page.goto(`${base}/lesson/${first.id}`);
    await page.getByRole("heading", { name: firstLesson.challenges[0].prompt }).waitFor({ timeout: 20_000 });
    await page.reload();
    await page.getByRole("heading", { name: firstLesson.challenges[0].prompt }).waitFor({ timeout: 20_000 });
    check(true, "a lesson loads and reloads directly");
    await page.goto(`${base}/review/session`);
    await page
      .getByText(/Nothing to review right now|Check/)
      .first()
      .waitFor({ timeout: 20_000 });
    check((await page.getByTestId("kit-failed").count()) === 0, "the review session loads directly");

    // Lessons used below, by position after `first` (the active one), all distinct:
    // 1 concurrent completion, 2 expired session, 3 overlapping lesson and review,
    // 4 failed resend and retry, 5 course-mismatch discard, 6 refused resubmission,
    // 7 failed profile lookup, 8 user-mismatch refusal of a kept submission,
    // 9 account change during an ordinary quiz, 10 an award made in between, 11 a lost
    // response then a reload, 12 a lost response then Continue, 13 a kit identity the
    // server no longer has.
    const at = (n: number) => lessons[lessons.indexOf(first) + n];
    const [second, third, overlapLesson, retryLesson, otherCourseLesson, mismatchLesson, lookupLesson, refusedLesson, switchLesson, betweenLesson, keptLesson, sameRetryLesson, identityLesson] =
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(at);
    const setPending = (p: object) =>
      page.evaluate((v) => sessionStorage.setItem("wordwave:pending-submission", JSON.stringify(v)), p);
    const pendingStored = () => page.evaluate(() => sessionStorage.getItem("wordwave:pending-submission"));

    // --- concurrent double completion of a new lesson: one award
    // Two different quizzes (two submission ids) for the same lesson at once.
    const lessonBody = () => ({ failedWordIds: [], correctWordIds: [], mistakes: 0, submissionId: randomUUID() });
    const body = lessonBody();
    const [a, b] = await Promise.all([
      post<{ firstCompletion: boolean; award: Award }>(`/api/lessons/${second.id}/complete`, lessonBody()),
      post<{ firstCompletion: boolean; award: Award }>(`/api/lessons/${second.id}/complete`, lessonBody()),
    ]);
    check([a, b].filter((r) => r.firstCompletion).length === 1, "concurrent completions: exactly one first completion");
    check([a, b].filter((r) => r.award.status === "awarded").length === 1, "concurrent completions: exactly one award");
    me = await json<UserBody>("/api/user");
    check(me.devTotals?.xp === 20, `two lessons, 20 XP (got ${me.devTotals?.xp})`);

    // --- expected-user mismatch is refused without writing
    const mismatch = await fetch(`${base}/api/lessons/${mismatchLesson.id}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-WordWave-Expect-User": "someone-else" },
      body: JSON.stringify(body),
    });
    check(mismatch.status === 409, `resubmission for another learner is 409 (got ${mismatch.status})`);
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: mismatchLesson.id } })) === 0, "and writes nothing");

    // --- review session: one review_session award
    await db.wordReview.updateMany({ where: { userId: MOCK_USER }, data: { dueAt: new Date(Date.now() - 1000) } });
    const review = await json<{ challenges: Challenge[] }>("/api/review");
    await page.goto(base + "/review");
    await page.getByRole("button", { name: "Start review" }).click();
    await page.getByRole("heading", { name: review.challenges[0].prompt }).waitFor({ timeout: 60_000 });
    for (const ch of review.challenges) await solveChallenge(page, ch, false);
    check((await resultStatus(page)) === "awarded", "review: award status awarded");
    me = await json<UserBody>("/api/user");
    check(me.devTotals?.xp === 30, `review earned one 10 XP award (xp ${me.devTotals?.xp})`);

    // --- a review that schedules nothing earns nothing (WW-INSPECT-001)
    const reviewed = new Set((await db.wordReview.findMany({ where: { userId: MOCK_USER } })).map((r) => r.wordId));
    const unscheduled = (await db.word.findMany({ where: { courseId: "es" }, take: 50 })).find((w) => !reviewed.has(w.id))!;
    const empty = await post<{ award: Award }>("/api/review/complete", { results: [{ wordId: unscheduled.id, correct: true }], submissionId: randomUUID() });
    check(empty.award.status === "skipped", `a correct answer for an unscheduled word is not a review (got ${empty.award.status})`);

    // --- overlapping lesson and review with opposing results for one word (WW-INSPECT-004)
    const word = missed[0].wordId;
    const lapsesBefore = (await db.wordReview.findFirstOrThrow({ where: { userId: MOCK_USER, wordId: word } })).lapses;
    await Promise.all([
      post(`/api/lessons/${overlapLesson.id}/complete`, { failedWordIds: [], correctWordIds: [word], mistakes: 0, submissionId: randomUUID() }),
      post("/api/review/complete", { results: [{ wordId: word, correct: false }], submissionId: randomUUID() }),
    ]);
    const lapsesAfter = (await db.wordReview.findFirstOrThrow({ where: { userId: MOCK_USER, wordId: word } })).lapses;
    check(lapsesAfter === lapsesBefore + 1, `the concurrent miss is kept (lapses ${lapsesBefore} -> ${lapsesAfter})`);

    // --- one quiz sent twice is applied once (WW-P5-R3-001)
    const once = { results: [{ wordId: word, correct: false }], submissionId: randomUUID() };
    const xpBeforeTwice = (await json<UserBody>("/api/user")).devTotals?.xp ?? 0;
    const firstSend = await post<{ award: Award; duplicate?: boolean }>("/api/review/complete", once);
    const lapsesOnce = (await db.wordReview.findFirstOrThrow({ where: { userId: MOCK_USER, wordId: word } })).lapses;
    const secondSend = await post<{ award: Award; duplicate?: boolean }>("/api/review/complete", once);
    const lapsesTwice = (await db.wordReview.findFirstOrThrow({ where: { userId: MOCK_USER, wordId: word } })).lapses;
    check(firstSend.award.status === "awarded" && !firstSend.duplicate, "the first send of a review is applied and awarded");
    check(secondSend.duplicate === true && secondSend.award.status === "awarded", "the repeat is recognised and reports the recorded outcome");
    check(lapsesTwice === lapsesOnce, `the repeat changes no schedule (lapses ${lapsesOnce} -> ${lapsesTwice})`);
    check((await json<UserBody>("/api/user")).devTotals?.xp === xpBeforeTwice + 10, "and awards no second time");

    // --- a kept review submission is sent even when nothing is due any more (WW-INSPECT-003)
    await db.wordReview.updateMany({ where: { userId: MOCK_USER }, data: { dueAt: new Date(Date.now() + 86_400_000) } });
    await page.goto(base + "/learn");
    await setPending({
      path: "/review/session",
      url: "/api/review/complete",
      body: { results: [{ wordId: word, correct: true }], submissionId: randomUUID() },
      userId: MOCK_USER,
      courseCode: "es",
      accuracy: 1,
    });
    await page.goto(base + "/review/session");
    check((await resultStatus(page)) === "awarded", "a kept review is sent on return although nothing is due");
    check((await pendingStored()) === null, "and removed once sent");

    // --- a failed resend keeps the exact answers and retries them (WW-INSPECT-002)
    await setPending({ path: `/lesson/${retryLesson.id}`, url: `/api/lessons/${retryLesson.id}/complete`, body: lessonBody(), userId: MOCK_USER, courseCode: "es", accuracy: 1 });
    await page.route(`**/api/lessons/${retryLesson.id}/complete`, (route) => route.fulfill({ status: 500, body: "{}" }));
    await page.goto(`${base}/lesson/${retryLesson.id}`);
    await page.getByTestId("recovery-failed").waitFor({ timeout: 20_000 });
    check((await pendingStored()) !== null, "a failed resend stays stored");
    await page.unroute(`**/api/lessons/${retryLesson.id}/complete`);
    await page.getByRole("button", { name: "Try again" }).click();
    check((await resultStatus(page)) === "awarded", "Try again resends the kept answers");
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: retryLesson.id } })) === 1, "the retried lesson is saved");
    check((await pendingStored()) === null, "a successful retry removes the kept submission (WW-P5-R2-001)");
    const xpAfterRetry = (await json<UserBody>("/api/user")).devTotals?.xp;
    const retryLessonData = await json<{ challenges: Challenge[] }>(`/api/lessons/${retryLesson.id}`);
    await page.reload();
    await page.getByRole("heading", { name: retryLessonData.challenges[0].prompt }).waitFor({ timeout: 20_000 });
    check((await json<UserBody>("/api/user")).devTotals?.xp === xpAfterRetry, "a reload after the retry sends nothing again");

    // --- a failed profile lookup keeps the answers and retries (WW-P5-R2-002)
    await setPending({ path: `/lesson/${lookupLesson.id}`, url: `/api/lessons/${lookupLesson.id}/complete`, body: lessonBody(), userId: MOCK_USER, courseCode: "es", accuracy: 1 });
    await page.route("**/api/user", (route) => route.fulfill({ status: 503, body: "{}" }));
    await page.goto(`${base}/lesson/${lookupLesson.id}`);
    await page.getByTestId("recovery-failed").waitFor({ timeout: 20_000 });
    check((await pendingStored()) !== null, "a failed identity lookup keeps the submission (no discard)");
    await page.unroute("**/api/user");
    await page.getByRole("button", { name: "Try again" }).click();
    check((await resultStatus(page)) === "awarded", "Try again checks identity again and sends");
    check((await pendingStored()) === null, "and removes it once sent");

    // --- a user-mismatch refusal discards the kept submission (WW-P5-R2-003)
    await setPending({ path: `/lesson/${refusedLesson.id}`, url: `/api/lessons/${refusedLesson.id}/complete`, body: lessonBody(), userId: MOCK_USER, courseCode: "es", accuracy: 1 });
    await page.route(`**/api/lessons/${refusedLesson.id}/complete`, (route) =>
      route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: "user-mismatch" }) })
    );
    const refusedData = await json<{ challenges: Challenge[] }>(`/api/lessons/${refusedLesson.id}`);
    await page.goto(`${base}/lesson/${refusedLesson.id}`);
    await page.getByRole("heading", { name: refusedData.challenges[0].prompt }).waitFor({ timeout: 20_000 });
    await page.unroute(`**/api/lessons/${refusedLesson.id}/complete`);
    check((await pendingStored()) === null, "a user-mismatch refusal discards the submission, no retry offered");
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: refusedLesson.id } })) === 0, "and nothing was saved");

    // --- a kept review whose first send committed but lost its response (WW-P5-R3-001)
    const lost = { results: [{ wordId: word, correct: false }], submissionId: randomUUID() };
    const lapsesBeforeLost = (await db.wordReview.findFirstOrThrow({ where: { userId: MOCK_USER, wordId: word } })).lapses;
    const xpBeforeLost = (await json<UserBody>("/api/user")).devTotals?.xp ?? 0;
    await setPending({ path: "/review/session", url: "/api/review/complete", body: lost, userId: MOCK_USER, courseCode: "es", accuracy: 1 });
    await page.route(
      "**/api/review/complete",
      async (route) => {
        await route.fetch(); // the server applies it...
        await route.abort(); // ...and the browser never hears back
      },
      { times: 1 }
    );
    await page.goto(base + "/review/session");
    await page.getByTestId("recovery-failed").waitFor({ timeout: 20_000 });
    // Another award lands before the learner retries; then they reload mid-recovery.
    await post(`/api/lessons/${betweenLesson.id}/complete`, lessonBody());
    await page.reload();
    check((await resultStatus(page)) === "awarded", "a reload after a lost response shows the recorded outcome");
    const lapsesAfterLost = (await db.wordReview.findFirstOrThrow({ where: { userId: MOCK_USER, wordId: word } })).lapses;
    check(lapsesAfterLost === lapsesBeforeLost + 1, `the lost-response review was applied once (lapses ${lapsesBeforeLost} -> ${lapsesAfterLost})`);
    const xpNow = (await json<UserBody>("/api/user")).devTotals?.xp;
    check(xpNow === xpBeforeLost + 20, `and awarded once, beside the award in between (xp ${xpBeforeLost} -> ${xpNow})`);
    check((await pendingStored()) === null, "and the kept submission is gone");
    await page.getByRole("button", { name: "Back to the path" }).click();
    await page.waitForURL("**/learn");
    check((await hudXp(page)) === xpNow, `the repeat's historical totals do not rewind the HUD (WW-P5-R4-002; HUD ${xpNow})`);

    // --- a repeat of a send that is still finishing waits for its outcome (WW-P5-R4-001)
    const recordedAward = { status: "awarded", result: { awarded_xp: 10, xp: xpNow, gems: 5, level: 1, streak: 1, level_up: false, new_achievements: [] } };
    const inflight = randomUUID();
    await db.submission.create({ data: { userId: MOCK_USER, id: inflight } });
    const early = await fetch(base + "/api/review/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ results: [{ wordId: word, correct: true }], submissionId: inflight }),
    });
    check(early.status === 202, `a repeat while the first send is unfinished answers 202 (got ${early.status})`);
    await setPending({ path: "/review/session", url: "/api/review/complete", body: { results: [{ wordId: word, correct: true }], submissionId: inflight }, userId: MOCK_USER, courseCode: "es", accuracy: 1 });
    await page.goto(base + "/review/session");
    await page.getByText("Saving your answers").waitFor({ timeout: 20_000 });
    await db.submission.update({ where: { userId_id: { userId: MOCK_USER, id: inflight } }, data: { award: JSON.stringify(recordedAward) } });
    check((await resultStatus(page)) === "awarded", "the page keeps asking and shows the outcome once it is recorded");
    check((await pendingStored()) === null, "and then lets the submission go");

    // --- an abandoned send is finalised as failed, never re-awarded
    const abandoned = randomUUID();
    await db.submission.create({ data: { userId: MOCK_USER, id: abandoned, createdAt: new Date(Date.now() - 120_000) } });
    const xpBeforeAbandoned = (await json<UserBody>("/api/user")).devTotals?.xp;
    const late = await post<{ duplicate?: boolean; award: Award }>("/api/review/complete", { results: [{ wordId: word, correct: true }], submissionId: abandoned });
    check(late.duplicate === true && late.award.status === "failed", `an abandoned send reports failed (got ${late.award.status})`);
    check((await json<UserBody>("/api/user")).devTotals?.xp === xpBeforeAbandoned, "and awards nothing");

    // --- another learner signs in while a quiz is open (WW-P5-R3-002)
    const switchData = await json<{ challenges: Challenge[] }>(`/api/lessons/${switchLesson.id}`);
    await page.goto(`${base}/lesson/${switchLesson.id}`);
    for (const ch of switchData.challenges.slice(0, -1)) await solveChallenge(page, ch, false);
    await page.route(
      `**/api/lessons/${switchLesson.id}/complete`,
      (route) => route.fulfill({ status: 409, contentType: "application/json", body: JSON.stringify({ error: "user-mismatch" }) }),
      { times: 1 }
    );
    await solveChallenge(page, switchData.challenges[switchData.challenges.length - 1], false);
    await page.getByText("signed in as a different learner").waitFor({ timeout: 20_000 });
    check(true, "a user-mismatch in an ordinary quiz reloads under the new identity and says so");
    await page.getByRole("heading", { name: switchData.challenges[0].prompt }).waitFor({ timeout: 20_000 });
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: switchLesson.id } })) === 0, "the old learner's answers were not saved");
    check((await pendingStored()) === null, "and not kept for anyone");

    await page.goto(base + "/learn");
    await hudXp(page);
    await page.route(
      "**/api/user",
      (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: "someone-else", displayName: "B", createdAt: new Date().toISOString(), lessonsCompleted: 0, activeCourseName: "Spanish", activeCourseCode: "es" }) }),
      { times: 1 }
    );
    await Promise.all([page.waitForEvent("load"), page.evaluate(() => window.dispatchEvent(new Event("focus")))]);
    await page.getByText("signed in as a different learner").waitFor({ timeout: 20_000 });
    check(true, "coming back to the tab after another learner signed in reloads the page");

    // --- an ordinary quiz is kept before its first send (WW-P5-R5-003): its response is
    // lost, the learner reloads, and the same submission recovers the outcome.
    const loseResponse = (id: string) =>
      page.route(
        `**/api/lessons/${id}/complete`,
        async (route) => {
          await route.fetch(); // the server applies it...
          await route.abort(); // ...and the browser never hears back
        },
        { times: 1 }
      );
    const keptData = await json<{ challenges: Challenge[] }>(`/api/lessons/${keptLesson.id}`);
    await page.goto(`${base}/lesson/${keptLesson.id}`);
    for (const ch of keptData.challenges.slice(0, -1)) await solveChallenge(page, ch, false);
    await loseResponse(keptLesson.id);
    await solveChallenge(page, keptData.challenges[keptData.challenges.length - 1], false);
    await page.getByText("Couldn't save your progress").first().waitFor({ timeout: 20_000 });
    check((await pendingStored()) !== null, "a quiz whose response was lost is still kept (WW-P5-R5-003)");
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: keptLesson.id } })) === 1, "(the server had applied it)");
    const xpKept = (await json<UserBody>("/api/user")).devTotals?.xp;
    await answerLeavePrompt(page, "accept", () => page.evaluate(() => void setTimeout(() => location.reload(), 0)));
    check((await resultStatus(page)) === "awarded", "a reload sends the kept quiz again and shows its recorded outcome");
    check((await pendingStored()) === null, "and lets it go");
    check((await json<UserBody>("/api/user")).devTotals?.xp === xpKept, "without a second award");

    // --- a repeat moves the HUD to the current totals (WW-P5-R5-001): a lost response,
    // then Continue on the same page, then back to the path without a reload.
    const sameData = await json<{ challenges: Challenge[] }>(`/api/lessons/${sameRetryLesson.id}`);
    await page.goto(`${base}/lesson/${sameRetryLesson.id}`);
    for (const ch of sameData.challenges.slice(0, -1)) await solveChallenge(page, ch, false);
    await loseResponse(sameRetryLesson.id);
    await solveChallenge(page, sameData.challenges[sameData.challenges.length - 1], false);
    await page.getByText("Couldn't save your progress").first().waitFor({ timeout: 20_000 });
    await page.getByRole("button", { name: "Continue" }).click();
    check((await resultStatus(page)) === "awarded", "Continue after a lost response shows the recorded outcome");
    const xpSame = (await json<UserBody>("/api/user")).devTotals?.xp;
    await page.getByRole("button", { name: "Back to the path" }).click();
    await page.waitForURL("**/learn");
    check((await hudXp(page)) === xpSame, `the HUD shows the current totals after a repeat (HUD ${xpSame})`);

    // --- the server names another learner than the one this page's kit started as
    // (WW-P5-R5-002): recovery reloads before any quiz renders under the old identity.
    // The first /api/user call is the mock kit's start-up; the second is recovery's.
    await setPending({ path: `/lesson/${identityLesson.id}`, url: `/api/lessons/${identityLesson.id}/complete`, body: lessonBody(), userId: MOCK_USER, courseCode: "es", accuracy: 1 });
    let userCalls = 0;
    const someoneElse = { id: "someone-else", displayName: "B", createdAt: new Date().toISOString(), lessonsCompleted: 0, activeCourseName: "Spanish", activeCourseCode: "es" };
    await page.route("**/api/user", (route) =>
      ++userCalls === 2
        ? route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(someoneElse) })
        : route.continue()
    );
    await page.goto(`${base}/lesson/${identityLesson.id}`);
    await page.getByText("signed in as a different learner").waitFor({ timeout: 20_000 });
    await page.unroute("**/api/user");
    check((await pendingStored()) === null, "recovery under a changed identity reloads and drops the other learner's answers");
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: identityLesson.id } })) === 0, "and sends nothing");

    // --- expired session mid-lesson: redirect, keep, resubmit once after sign-in
    const thirdLesson = await json<{ challenges: Challenge[] }>(`/api/lessons/${third.id}`);
    await page.goto(`${base}/lesson/${third.id}`);
    const chs = thirdLesson.challenges;
    for (const ch of chs.slice(0, -1)) await solveChallenge(page, ch, false);
    await context.addCookies([{ name: "ww-dev-expired", value: "1", url: base }]);
    await solveChallenge(page, chs[chs.length - 1], false);
    await page.waitForURL("https://class.travelschooling.com/**", { timeout: 20_000 });
    check(
      page.url() === PORTAL_LOGIN + encodeURIComponent(`${base}/lesson/${third.id}`),
      `expired session goes to the portal login with this lesson as next (got ${page.url()})`
    );
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: third.id } })) === 0, "nothing saved while signed out");
    await context.clearCookies({ name: "ww-dev-expired" });
    await page.goto(`${base}/lesson/${third.id}`);
    const recovered = await resultStatus(page).catch(async (e) => {
      console.error("recovery page text:", (await page.locator("body").innerText()).slice(0, 300));
      throw e;
    });
    check(recovered === "awarded", `after sign-in the kept submission is sent once and awarded (got ${recovered})`);
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: third.id } })) === 1, "the lesson is now saved");
    await page.reload();
    await page.getByRole("heading", { name: chs[0].prompt }).waitFor({ timeout: 20_000 });
    check(true, "a second load does not resubmit (a fresh quiz is shown)");

    // --- launcher summary across a course switch
    me = await json<UserBody>("/api/user");
    const revBeforeSwitch = me.devSummary?.rev ?? 0;
    check(revBeforeSwitch > revAfterFirst, `summary revisions increase (${revAfterFirst} -> ${revBeforeSwitch})`);
    await post("/api/course/active", { courseCode: "la" });
    me = await json<UserBody>("/api/user");
    check((me.devSummary?.rev ?? 0) > revBeforeSwitch, "a course switch publishes a newer summary");
    check(me.devSummary?.summary.headline === "0 lessons done in Latin", `headline follows the switch (got ${me.devSummary?.summary.headline})`);
    const dbRev = (await db.user.findUniqueOrThrow({ where: { id: MOCK_USER } })).summaryRev;
    check(dbRev === me.devSummary?.rev, `the database revision matches the published one (${dbRev})`);

    // --- a kept Spanish submission is discarded, not replayed, once the course is Latin
    // (WW-INSPECT-003), even though the Spanish lesson no longer loads.
    await page.goto(base + "/learn");
    await setPending({ path: `/lesson/${otherCourseLesson.id}`, url: `/api/lessons/${otherCourseLesson.id}/complete`, body: lessonBody(), userId: MOCK_USER, courseCode: "es", accuracy: 1 });
    await page.goto(`${base}/lesson/${otherCourseLesson.id}`);
    await page.getByText("This lesson doesn't exist.").waitFor({ timeout: 20_000 });
    check((await pendingStored()) === null, "a submission for another course is discarded");
    await post("/api/course/active", { courseCode: "es" });
    await page.goto(`${base}/lesson/${otherCourseLesson.id}`);
    const otherLesson = await json<{ challenges: Challenge[] }>(`/api/lessons/${otherCourseLesson.id}`);
    await page.getByRole("heading", { name: otherLesson.challenges[0].prompt }).waitFor({ timeout: 20_000 });
    check((await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: otherCourseLesson.id } })) === 0, "and never replays after switching back");

    // --- Return to Home Room and the leave guard (home-room plan A3/A4). Last, because it
    // completes a lesson and earlier checks compare absolute XP.
    const noPrompt = async (label: string, trigger: () => Promise<unknown>, until: () => Promise<unknown>) => {
      const seen: string[] = [];
      const record = (d: Dialog) => {
        seen.push(d.type());
        void d.accept().catch(() => {});
      };
      page.on("dialog", record);
      try {
        await trigger();
        await until();
      } finally {
        page.off("dialog", record);
      }
      check(seen.length === 0, `${label}: no browser leave prompt (saw ${seen.join(", ") || "none"})`);
    };
    const progressNow = () => page.getByRole("progressbar").getAttribute("aria-valuenow");

    // Every main screen of the app shell has the button; on /learn it goes home.
    for (const p of ["/review", "/awards", "/profile", "/learn"]) {
      await page.goto(base + p);
      await homeRoom().waitFor({ timeout: 60_000 });
      check((await homeRoom().count()) === 1, `${p} has one Return to Home Room button`);
    }
    await hudXp(page);
    await noPrompt("Home Room on /learn", () => homeRoom().click(), () => page.waitForURL(HOME, { timeout: 20_000 }));
    check(page.url() === HOME, `Home Room on /learn navigates to the portal (got ${page.url()})`);

    // Starting a lesson from the path is a document navigation.
    const guardUnits = await json<Units>("/api/units");
    const guard = guardUnits.sections
      .flatMap((s) => s.units)
      .flatMap((u) => u.lessons)
      .find((l) => l.id === guardUnits.activeLessonId)!;
    const guardData = await json<{ challenges: Challenge[] }>(`/api/lessons/${guard.id}`);
    const guardFirst = () => page.getByRole("heading", { name: guardData.challenges[0].prompt });
    await page.goto(base + "/learn");
    await hudXp(page);
    await page.evaluate(() => {
      (window as unknown as { __wwMarker?: number }).__wwMarker = 1;
    });
    await page.getByRole("button", { name: `${guard.title} — start lesson` }).click();
    await page.waitForURL(`**/lesson/${guard.id}`, { timeout: 30_000 });
    await guardFirst().waitFor({ timeout: 60_000 });
    check(
      (await page.evaluate(() => (window as unknown as { __wwMarker?: number }).__wwMarker)) === undefined,
      "starting a lesson from the path loads a new document (the page marker is gone)"
    );
    check((await homeRoom().count()) === 1, "the quiz has a Return to Home Room button above it");

    // X before answering leaves without asking; Back, answer one, Forward: the browser asks.
    await noPrompt(
      "X before answering",
      () => page.getByRole("button", { name: "Quit session" }).click(),
      () => page.waitForURL("**/learn", { timeout: 20_000 })
    );
    await page.goBack();
    await guardFirst().waitFor({ timeout: 60_000 });
    await solveChallenge(page, guardData.challenges[0], false);
    const answered = await progressNow();
    check(Number(answered) > 0, `one answer given (progress ${answered})`);
    const forward = await answerLeavePrompt(page, "dismiss", () => historyStep(page, "forward"));
    check(forward === "beforeunload", `Forward after answering raises the leave prompt (got ${forward})`);
    await page.waitForTimeout(500);
    check(
      page.url().endsWith(`/lesson/${guard.id}`) && (await progressNow()) === answered,
      "dismissing the Forward prompt keeps the quiz"
    );
    const back = await answerLeavePrompt(page, "dismiss", () => historyStep(page, "back"));
    check(back === "beforeunload", `Back after answering raises the leave prompt (got ${back})`);
    await page.waitForTimeout(500);
    check(
      page.url().endsWith(`/lesson/${guard.id}`) && (await progressNow()) === answered,
      "dismissing the Back prompt keeps the quiz"
    );
    const backAccept = await answerLeavePrompt(page, "accept", () => historyStep(page, "back"));
    await page.waitForURL("**/learn", { timeout: 20_000 });
    check(backAccept === "beforeunload", "accepting the Back prompt leaves the lesson");

    // Home Room with an answer given: the in-page dialog; Escape and Stay keep the quiz.
    await page.goto(`${base}/lesson/${guard.id}`);
    await guardFirst().waitFor({ timeout: 60_000 });
    await solveChallenge(page, guardData.challenges[0], false);
    const kept = await progressNow();
    await homeRoom().click();
    const dialog = page.getByRole("dialog", { name: "Your lesson is not finished." });
    await dialog.waitFor({ timeout: 10_000 });
    check((await dialog.getAttribute("aria-modal")) === "true", "the dialog is modal");
    check(
      (await dialog.innerText()).includes("Finish it to save your progress. If you leave now, this lesson's answers are lost."),
      "the dialog says what is unsaved and how to save it"
    );
    check(
      await page.evaluate(() => document.activeElement?.closest('[role="dialog"]') != null),
      "focus moves into the dialog"
    );
    await page.keyboard.press("Escape");
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
    check(
      await page.evaluate(() => document.activeElement?.textContent?.includes("Return to Home Room") ?? false),
      "Escape stays and returns focus to the button"
    );
    await homeRoom().click();
    await dialog.getByRole("button", { name: "Stay and save" }).click();
    await dialog.waitFor({ state: "detached", timeout: 5_000 });
    check(
      page.url().endsWith(`/lesson/${guard.id}`) && (await progressNow()) === kept,
      "Stay and save keeps the question"
    );

    // The X asks too; Leave without saving goes to its usual place without a second prompt.
    await page.getByRole("button", { name: "Quit session" }).click();
    await dialog.waitFor({ timeout: 10_000 });
    await noPrompt(
      "X, Leave without saving",
      () => dialog.getByRole("button", { name: "Leave without saving" }).click(),
      () => page.waitForURL("**/learn", { timeout: 20_000 })
    );

    await page.goto(`${base}/lesson/${guard.id}`);
    await guardFirst().waitFor({ timeout: 60_000 });
    await solveChallenge(page, guardData.challenges[0], false);
    await homeRoom().click();
    await dialog.waitFor({ timeout: 10_000 });
    await noPrompt(
      "Home Room, Leave without saving",
      () => dialog.getByRole("button", { name: "Leave without saving" }).click(),
      () => page.waitForURL(HOME, { timeout: 20_000 })
    );
    check(page.url() === HOME, "Home Room then Leave without saving goes to the portal");

    // A departure that never happens (Codex WW-HR-001, WW-HR-004): the portal answers 204
    // No Content, which the browser treats as a cancelled navigation, so the document
    // stays (like pressing Stop). Leave without saving closes the dialog at once, the page
    // holds still during the departure, and 3 s later the quiz, the button and the leave
    // prompt are all back.
    await page.route(HOME, (route) => route.fulfill({ status: 204 }));
    await page.goto(`${base}/lesson/${guard.id}`);
    await guardFirst().waitFor({ timeout: 60_000 });
    await solveChallenge(page, guardData.challenges[0], false);
    const beforeStop = await progressNow();
    await homeRoom().click();
    await dialog.waitFor({ timeout: 10_000 });
    const leftAt = Date.now();
    await dialog
      .getByRole("button", { name: "Leave without saving" })
      .evaluate((el) => (el as HTMLButtonElement).click());
    await page.waitForTimeout(500);
    check((await page.getByRole("dialog").count()) === 0, "Leave without saving closes the dialog at once (no Stay during the departure)");
    const busyDuring = await homeRoom().getAttribute("aria-disabled");
    const quizHeld = await page.locator("fieldset").evaluate((f) => (f as HTMLFieldSetElement).disabled);
    check(Date.now() - leftAt < 2_500 && busyDuring === "true" && quizHeld, "during the departure the button is busy and the quiz holds still");
    await page.waitForTimeout(3_500);
    check(
      page.url().endsWith(`/lesson/${guard.id}`) && (await progressNow()) === beforeStop,
      "a departure that did not happen leaves the quiz as it was"
    );
    check((await homeRoom().getAttribute("aria-disabled")) === null, "and Return to Home Room is usable again");
    check(!(await page.locator("fieldset").evaluate((f) => (f as HTMLFieldSetElement).disabled)), "and the quiz answers again");
    const reArmed = await answerLeavePrompt(page, "dismiss", () => historyStep(page, "back"));
    check(reArmed === "beforeunload", `and the answers are protected by the leave prompt again (got ${reArmed})`);
    await page.unroute(HOME);
    await answerLeavePrompt(page, "accept", () =>
      page.evaluate(() => {
        setTimeout(() => location.assign("/learn"), 0);
      })
    );
    await page.waitForURL("**/learn", { timeout: 20_000 });

    // A slow destination (Codex WW-HR-006): the portal answers 200 only after 5 s. At 3 s
    // the page cancels that navigation, so it never commits over what the learner does
    // next; answering works, and a later Home Room press still leaves.
    await page.route(HOME, async (route) => {
      await new Promise((r) => setTimeout(r, 5_000));
      await route.fulfill({ status: 200, contentType: "text/html", body: "<title>slow portal</title>slow" }).catch(() => {});
    });
    await page.goto(`${base}/lesson/${guard.id}`);
    await guardFirst().waitFor({ timeout: 60_000 });
    await solveChallenge(page, guardData.challenges[0], false);
    const beforeSlow = Number(await progressNow());
    await homeRoom().click();
    await dialog.waitFor({ timeout: 10_000 });
    const slowLeftAt = Date.now();
    await dialog
      .getByRole("button", { name: "Leave without saving" })
      .evaluate((el) => (el as HTMLButtonElement).click());
    await page.waitForTimeout(3_500);
    check(page.url().endsWith(`/lesson/${guard.id}`), "a slow destination: still on the quiz after 3 s");
    check((await homeRoom().getAttribute("aria-disabled")) === null, "and the quiz is given back");
    await solveChallenge(page, guardData.challenges[1], false);
    const afterSlow = Number(await progressNow());
    check(afterSlow > beforeSlow, `answering works again (progress ${beforeSlow} -> ${afterSlow})`);
    await page.waitForTimeout(Math.max(0, 7_000 - (Date.now() - slowLeftAt)));
    check(
      page.url().endsWith(`/lesson/${guard.id}`) && Number(await progressNow()) === afterSlow,
      `the cancelled navigation never commits (7 s on: ${page.url()})`
    );
    await page.unroute(HOME);
    await homeRoom().click();
    await dialog.waitFor({ timeout: 10_000 });
    await noPrompt(
      "a later Home Room, Leave without saving",
      () => dialog.getByRole("button", { name: "Leave without saving" }).click(),
      () => page.waitForURL(HOME, { timeout: 20_000 })
    );
    check(page.url() === HOME, "a later Home Room press still leaves normally");

    // A finished lesson: Home Room on the result screen goes straight home.
    await page.goto(`${base}/lesson/${guard.id}`);
    await guardFirst().waitFor({ timeout: 60_000 });
    await playLesson(page, guardData.challenges, false);
    await resultStatus(page);
    await noPrompt(
      "Home Room on the result screen",
      () => homeRoom().click(),
      () => page.waitForURL(HOME, { timeout: 20_000 })
    );
    check(
      (await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: guard.id } })) === 1,
      "the finished lesson was saved before leaving"
    );

    // A kept submission being resent: Home Room waits for it (at most 2 s).
    const [shortWait, longWait] = [11, 12].map(at);
    const pendingFor = (l: { id: string }) => ({
      path: `/lesson/${l.id}`,
      url: `/api/lessons/${l.id}/complete`,
      body: lessonBody(),
      userId: MOCK_USER,
      courseCode: "es",
      accuracy: 1,
    });
    const delayed = (ms: number) => async (route: Route) => {
      await new Promise((r) => setTimeout(r, ms));
      await route.continue().catch(() => {});
    };

    await page.goto(base + "/learn");
    await setPending(pendingFor(shortWait));
    await page.route(`**/api/lessons/${shortWait.id}/complete`, delayed(1500));
    await page.goto(`${base}/lesson/${shortWait.id}`);
    await page.getByText("Saving your answers").waitFor({ timeout: 60_000 });
    await homeRoom().click();
    await page.waitForURL(HOME, { timeout: 20_000 });
    await page.unroute(`**/api/lessons/${shortWait.id}/complete`);
    check(
      (await db.lessonProgress.count({ where: { userId: MOCK_USER, lessonId: shortWait.id } })) === 1,
      "Home Room waited for the resend to finish before leaving"
    );
    await page.goto(base + "/learn");
    check((await pendingStored()) === null, "and the kept submission was cleared");

    await setPending(pendingFor(longWait));
    await page.route(`**/api/lessons/${longWait.id}/complete`, delayed(5000));
    await page.goto(`${base}/lesson/${longWait.id}`);
    await page.getByText("Saving your answers").waitFor({ timeout: 60_000 });
    const pressed = Date.now();
    await homeRoom().click();
    await page.waitForURL(HOME, { timeout: 20_000 });
    const waited = Date.now() - pressed;
    check(waited >= 1800 && waited < 4500, `Home Room gives a slow resend about 2 s, then leaves (waited ${waited} ms)`);
    await page.unroute(`**/api/lessons/${longWait.id}/complete`);
    await page.goto(base + "/learn");
    const leftBehind = await pendingStored();
    check(leftBehind !== null && leftBehind.includes(longWait.id), "the kept submission stays for the next visit");
    await page.evaluate(() => sessionStorage.removeItem("wordwave:pending-submission"));

    // A delayed course change, then Home Room (Codex WW-HR-002): Home Room waits for the
    // write and the course change never sends the learner to /learn afterwards.
    const activeCourse = async () =>
      (await db.user.findUniqueOrThrow({ where: { id: MOCK_USER } })).activeCourseId;
    const stillHome = async (label: string) => {
      await page.waitForURL(HOME, { timeout: 20_000 });
      await page.waitForTimeout(2500); // longer than the write's remaining delay
      check(page.url() === HOME, `${label}: Home Room wins, no /learn afterwards (at ${page.url()})`);
    };
    await page.route("**/api/course/active", delayed(1200));

    await page.goto(base + "/learn");
    await hudXp(page);
    await page.getByRole("button", { name: /Switch course/ }).click();
    await page.getByRole("menuitemradio", { name: /Latin/ }).click();
    await homeRoom().click();
    await stillHome("top bar course switch");
    check((await activeCourse()) === "la", "and the course change was saved before leaving");

    await db.user.update({ where: { id: MOCK_USER }, data: { activeCourseId: null } });
    await page.goto(base + "/welcome");
    await page.getByRole("button", { name: /Spanish/ }).waitFor({ timeout: 60_000 });
    await page.getByRole("button", { name: /Spanish/ }).click();
    await homeRoom().click();
    await stillHome("/welcome course pick");
    check((await activeCourse()) === "es", "and the course pick was saved before leaving");
    await page.unroute("**/api/course/active");

    // The kit's start screens keep Home Room (Codex WW-HR-005): a slow start, then ready
    // with no second button; a failed start, from which Home Room still goes home.
    await page.route("**/api/user", delayed(3000), { times: 1 });
    await page.goto(base + "/learn");
    await page.getByTestId("kit-loading").waitFor({ timeout: 60_000 });
    check((await homeRoom().count()) === 1, "a slow kit start shows Return to Home Room");
    await hudXp(page);
    check((await homeRoom().count()) === 1, "and once ready there is still exactly one");
    await page.route("**/api/user", (route) => route.abort(), { times: 1 });
    await page.goto(base + "/learn");
    await page.getByTestId("kit-failed").waitFor({ timeout: 60_000 });
    check((await homeRoom().count()) === 1, "a failed kit start shows Return to Home Room");
    await noPrompt("Home Room on the kit-failed screen", () => homeRoom().click(), () => page.waitForURL(HOME, { timeout: 20_000 }));
    check(page.url() === HOME, "and it goes to the portal");

    await context.close();
  } finally {
    await browser.close();
    stopServer(server, port);
    await db.$disconnect();
  }
}

async function main() {
  const only = process.argv[2];
  if (only !== "b") await gateInProductionMode();
  if (only !== "a") await learnerFlowInDevMode();
  if (failures.length) {
    console.error(`\n${failures.length} FAILURE(S)`);
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log("\nALL E2E CHECKS PASSED");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
