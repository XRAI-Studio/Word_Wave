import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * A quiz session is its own document (home-room plan, "Latin & Spanish"): every way in
 * and out of it is a full navigation, so every departure is one `beforeunload` covers.
 * A client-side (App Router) navigation would share a document with /learn or /review
 * and slip past the browser's leave prompt.
 */
const root = path.resolve(__dirname, "..");
const read = (rel: string) => readFileSync(path.join(root, rel), "utf8");

function filesUnder(rel: string): string[] {
  const dir = path.join(root, rel);
  return readdirSync(dir).flatMap((name) => {
    const child = path.join(rel, name);
    return statSync(path.join(root, child)).isDirectory()
      ? filesUnder(child)
      : /\.(tsx?|jsx?)$/.test(name)
        ? [child]
        : [];
  });
}

// The session pages and everything they render of their own.
const sessionFiles = [
  ...filesUnder("src/app/lesson"),
  ...filesUnder("src/app/review/session"),
  ...filesUnder("src/components/quiz"),
  "src/components/pending-recovery.tsx",
  "src/components/session-bar.tsx",
  "src/components/home-room.tsx",
];

describe("quiz sessions are their own document", () => {
  it("covers the session pages and quiz components", () => {
    expect(sessionFiles).toContain(path.join("src/app/lesson/[lessonId]/page.tsx"));
    expect(sessionFiles).toContain(path.join("src/app/review/session/page.tsx"));
    expect(sessionFiles).toContain(path.join("src/components/quiz/quiz.tsx"));
    expect(sessionFiles).toContain(path.join("src/components/quiz/result-screen.tsx"));
  });

  it.each(sessionFiles)("%s has no client-side navigation", (file) => {
    const src = read(file);
    expect(src).not.toMatch(/router\.(push|replace)\s*\(/);
    expect(src).not.toMatch(/\buseRouter\b/);
    expect(src).not.toMatch(/from\s+["']next\/link["']/);
  });

  it.each([
    ["src/components/learn/lesson-path.tsx", "window.location.assign(`/lesson/${lesson.id}`)"],
    ["src/components/course-menu.tsx", "window.location.assign(`/lesson/${lesson.id}`)"],
    ["src/app/(main)/review/page.tsx", 'window.location.assign("/review/session")'],
  ])("%s starts a session with a full navigation", (file, call) => {
    const src = read(file);
    expect(src).toContain(call);
    expect(src).not.toMatch(/router\.(push|replace)\s*\(/);
  });

  it("the session exits are full navigations", () => {
    expect(read("src/components/quiz/result-screen.tsx")).toContain('window.location.assign("/learn")');
    expect(read("src/app/review/session/page.tsx")).toContain('window.location.assign("/learn")');
    // The X and Home Room go through the leave guard, which navigates with location.assign.
    expect(read("src/components/quiz/quiz.tsx")).toContain('leave.request(mode === "lesson" ? "/learn" : "/review"');
    expect(read("src/lib/leave-guard.ts")).toContain("window.location.assign(url)");
  });

  it("no link anywhere routes into a session client-side", () => {
    for (const file of filesUnder("src")) {
      const src = read(file);
      expect(src, file).not.toMatch(/router\.(push|replace)\(\s*[`"']\/(lesson|review\/session)/);
      expect(src, file).not.toMatch(/href=\{?[`"']\/(lesson|review\/session)/);
    }
  });
});
