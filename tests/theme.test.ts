import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import GlobalError from "@/app/global-error";
import { THEME_COOKIE, THEME_HEAD_SCRIPT } from "@/lib/theme-head-script";

// The hash recorded in the portal's docs/class-standard.md section 6.1.
const STANDARD_SHA256 = "52ad95b1be229499b0f5cbc300824b4b9584fc27d44683dd353f5d20e3569423";

describe("ts-theme head script (class standard section 6)", () => {
  it("is the canonical copy, byte for byte", () => {
    expect(createHash("sha256").update(THEME_HEAD_SCRIPT, "utf8").digest("hex")).toBe(STANDARD_SHA256);
    expect(THEME_COOKIE).toBe("ts_theme");
  });

  it("runs from the root layout's head, with ThemeSync in the body", () => {
    const layout = readFileSync("src/app/layout.tsx", "utf8");
    expect(layout).toContain("<script dangerouslySetInnerHTML={{ __html: THEME_HEAD_SCRIPT }} />");
    expect(layout).toMatch(/<html[^>]*suppressHydrationWarning/);
    expect(layout).toMatch(/<body[^>]*>\s*<ThemeSync \/>/);
    expect(layout).not.toMatch(/cookies\(\)/);
  });

  it("also runs on the global error page, which carries its own two-theme styles", () => {
    const html = renderToStaticMarkup(createElement(GlobalError, { error: new Error("x"), reset: () => {} }));
    expect(html).toContain(THEME_HEAD_SCRIPT.slice(0, 60));
    expect(html.indexOf("ts-theme v1")).toBeLessThan(html.indexOf("<body"));
    expect(html).toContain(':root[data-theme="dark"] body');
    expect(html).not.toMatch(/color-scheme:\s*light/);
  });
});

describe("dark styles key off data-theme only", () => {
  const css = readFileSync("src/app/globals.css", "utf8");

  it("uses the data-theme variant and block, not the .dark class or the OS query", () => {
    expect(css).toContain("@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));");
    expect(css).toContain(':root[data-theme="dark"] {');
    expect(css).not.toMatch(/^\.dark\s*\{/m);
    expect(css).not.toContain("prefers-color-scheme");
    expect(css).not.toMatch(/color-scheme:\s*light/);
  });

  it("defines no later :root block that would override the dark values", () => {
    const dark = css.indexOf(':root[data-theme="dark"]');
    expect(css.slice(dark + 1)).not.toMatch(/^:root\s*\{/m);
  });

  it("leaves no hard-coded white surface or black text in the app's components", () => {
    const hits = readdirSync("src", { recursive: true, encoding: "utf8" })
      .filter((f) => f.endsWith(".tsx"))
      .filter((f) => /\b(bg-white|text-black)\b/.test(readFileSync(join("src", f), "utf8")));
    expect(hits).toEqual([]);
  });
});

describe("static production 500 page (same gap as Codex PORTAL-APPEARANCE-012)", () => {
  it("exists as a Pages Router 500 page, so Next keeps it instead of its OS-themed built-in", () => {
    const src = readFileSync("src/pages/500.tsx", "utf8");
    expect(src).toContain("THEME_HEAD_SCRIPT");
    expect(src).toContain("ERROR_PAGE_STYLE");
    expect(src).toMatch(/<a className="action" href="">/);
  });

  it("renders a Reload link, and global-error uses the same shared styles", async () => {
    const { default: ServerError } = await import("@/pages/500");
    const html = renderToStaticMarkup(createElement(ServerError));
    expect(html).toContain("Reload");
    expect(readFileSync("src/app/global-error.tsx", "utf8")).toContain("ERROR_PAGE_STYLE");
  });

  it("shares the error-page styles: data-theme keyed, 16px text, 44px action, no OS media rule", async () => {
    const { ERROR_PAGE_STYLE } = await import("@/lib/error-page-style");
    expect(ERROR_PAGE_STYLE).toContain(':root[data-theme="dark"] body');
    expect(ERROR_PAGE_STYLE).toMatch(/\.action \{[^}]*min-height: 44px/);
    expect(ERROR_PAGE_STYLE).toMatch(/p \{ font-size: 1rem;/);
    expect(ERROR_PAGE_STYLE).not.toMatch(/@media[^{]*prefers-color-scheme/);
    expect(ERROR_PAGE_STYLE).not.toMatch(/color-scheme:\s*light/);
  });
});
