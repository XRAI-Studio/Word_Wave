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
 * course switch, direct loads of both quiz routes, and the expired-session round trip
 * with the pending submission.
 *
 * It resets the mock learner's rows first; it never touches production.
 */
import { execFileSync, spawn, type ChildProcess } from "node:child_process";
import http from "node:http";
import net from "node:net";
import { chromium, type Page } from "playwright";
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

async function learnerFlowInDevMode() {
  log("part (b): learner flow on the dev mock");
  if (!process.env.DATABASE_URL?.includes("localhost")) {
    throw new Error("part (b) needs DATABASE_URL pointing at the local `npm run db:dev` database");
  }
  const db = createDbClient(process.env.DATABASE_URL, 2);
  await db.user.deleteMany({ where: { id: MOCK_USER } }); // cascades progress and reviews

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

    // Lessons used below, by position after `first` (the active one): `second` for the
    // concurrent completion, `third` for the expired session, `mismatchLesson` (six on)
    // for the refused resubmission. They must stay distinct.
    const at = (n: number) => lessons[lessons.indexOf(first) + n];
    const [second, third, mismatchLesson] = [at(1), at(2), at(6)];

    // --- concurrent double completion of a new lesson: one award
    const body = { failedWordIds: [], correctWordIds: [], mistakes: 0 };
    const [a, b] = await Promise.all([
      post<{ firstCompletion: boolean; award: Award }>(`/api/lessons/${second.id}/complete`, body),
      post<{ firstCompletion: boolean; award: Award }>(`/api/lessons/${second.id}/complete`, body),
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
    for (const ch of review.challenges) await solveChallenge(page, ch, false);
    check((await resultStatus(page)) === "awarded", "review: award status awarded");
    me = await json<UserBody>("/api/user");
    check(me.devTotals?.xp === 30, `review earned one 10 XP award (xp ${me.devTotals?.xp})`);

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
    check((await resultStatus(page)) === "awarded", "after sign-in the kept submission is sent once and awarded");
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
    await post("/api/course/active", { courseCode: "es" });

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
