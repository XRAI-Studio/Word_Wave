import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { HomeRoomButton, LeaveDialog, leaveMessage } from "@/components/home-room";
import { SessionBar } from "@/components/session-bar";
import { SIGN_IN_AGAIN } from "@/components/quiz/quiz";

const noop = () => {};

describe("Return to Home Room (home-room plan A3/A4)", () => {
  it("is a DOM button labelled exactly 'Return to Home Room'", () => {
    const html = renderToStaticMarkup(createElement(HomeRoomButton));
    expect(html).toMatch(/^<button type="button"/);
    // The icon is hidden, so the accessible name is the text alone.
    expect(html).toContain('aria-hidden="true"');
    expect(html.replace(/<svg[\s\S]*?<\/svg>/, "")).toMatch(/>\s*Return to Home Room\s*<\/button>$/);
    expect(html).toContain("focus-visible:outline");
  });

  it("sits in the session bar above every quiz branch", () => {
    expect(renderToStaticMarkup(createElement(SessionBar))).toContain("Return to Home Room");
  });
});

describe("leave dialog", () => {
  const render = (kind: "lesson" | "review") =>
    renderToStaticMarkup(createElement(LeaveDialog, { kind, onStay: noop, onLeave: noop }));

  it("is a labelled modal dialog", () => {
    const html = render("lesson");
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    const labelledBy = html.match(/aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeTruthy();
    expect(html).toContain(`id="${labelledBy}"`);
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(html).toContain(`id="${describedBy}"`);
  });

  it("says what is unsaved and how to save it, for a lesson", () => {
    const { title, body } = leaveMessage("lesson");
    expect(`${title} ${body}`).toBe(
      "Your lesson is not finished. Finish it to save your progress. If you leave now, this lesson's answers are lost."
    );
    const html = render("lesson");
    expect(html).toContain("Your lesson is not finished.");
    expect(html).toContain("this lesson&#x27;s answers are lost.");
  });

  it("says review for a review", () => {
    const { title, body } = leaveMessage("review");
    expect(`${title} ${body}`).toBe(
      "Your review is not finished. Finish it to save your progress. If you leave now, this review's answers are lost."
    );
  });

  it("offers Stay and save first (primary) and Leave without saving second", () => {
    const html = render("review");
    const stay = html.indexOf(">Stay and save</button>");
    const leave = html.indexOf(">Leave without saving</button>");
    expect(stay).toBeGreaterThan(0);
    expect(leave).toBeGreaterThan(stay);
    expect(html.slice(0, stay)).toContain("bg-brand"); // the primary variant
  });
});

describe("expired session while saving (HR-004)", () => {
  it("tells the learner what is happening and how to retry", () => {
    expect(SIGN_IN_AGAIN).toBe("Signing you in again… If nothing happens, press Check again.");
  });
});

describe("the kit's start screens keep Home Room (Codex WW-HR-005)", () => {
  const count = (html: string) => html.split("Return to Home Room").length - 1;

  it("while loading and after a failed start, exactly one button", async () => {
    const { KitBootScreen } = await import("@/components/kit-provider");
    for (const status of ["loading", "kit-failed"] as const) {
      const html = renderToStaticMarkup(createElement(KitBootScreen, { status, onRetry: noop }));
      expect(count(html), status).toBe(1);
    }
  });

  it("none on the redirect screen: the browser is already going to sign in", async () => {
    const { KitBootScreen } = await import("@/components/kit-provider");
    const html = renderToStaticMarkup(createElement(KitBootScreen, { status: "redirecting", onRetry: noop }));
    expect(count(html)).toBe(0);
  });

  it("the provider's first paint (still loading) has it, and not the page's own", async () => {
    const { KitProvider } = await import("@/components/kit-provider");
    const html = renderToStaticMarkup(createElement(KitProvider, null, createElement("p", null, "page")));
    expect(count(html)).toBe(1);
    expect(html).toContain('data-testid="kit-loading"');
    expect(html).not.toContain("<p>page</p>");
  });
});
