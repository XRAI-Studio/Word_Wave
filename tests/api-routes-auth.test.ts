import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

// Class standard rule 2.3: every API route verifies the session before anything else.
// The page gate excludes api/, so a route that forgot would be open.
function routes(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) return routes(p);
    return name === "route.ts" ? [p] : [];
  });
}

const root = path.join(__dirname, "..");
const files = routes(path.join(root, "src", "app", "api"));

describe("API routes verify the session (rule 2.3)", () => {
  it("finds the routes", () => {
    expect(files.length).toBeGreaterThanOrEqual(8);
  });

  it.each(files.map((f) => [path.relative(root, f), f]))(
    "%s calls requireUser or requireActiveCourse before anything else",
    (_rel, file) => {
      const src = readFileSync(file, "utf8");
      expect(src).toMatch(/from "@\/lib\/auth"/);
      const handlers = src.split(/export async function (?:GET|POST|PUT|PATCH|DELETE)\(/).slice(1);
      expect(handlers.length).toBeGreaterThan(0);
      for (const body of handlers) {
        const firstAwait = body.match(/await ([A-Za-z_.]+)\(/)?.[1];
        expect(["requireUser", "requireActiveCourse"]).toContain(firstAwait);
      }
    }
  );
});
