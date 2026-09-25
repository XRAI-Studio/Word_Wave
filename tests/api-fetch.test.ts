import { describe, expect, it, vi } from "vitest";
import { apiFetch, authRedirectTarget, RedirectingError } from "@/lib/api-fetch";

const HERE = "https://wordwave.travelschooling.com/lesson/L1";

describe("apiFetch (work order criterion 21)", () => {
  it("maps 401 to the portal login with this page as next, 403 to the waiting page", () => {
    expect(authRedirectTarget(401, HERE)).toBe(
      "https://class.travelschooling.com/login?next=https%3A%2F%2Fwordwave.travelschooling.com%2Flesson%2FL1"
    );
    expect(authRedirectTarget(403, HERE)).toBe("https://class.travelschooling.com/waiting");
    expect(authRedirectTarget(200, HERE)).toBeNull();
    expect(authRedirectTarget(404, HERE)).toBeNull();
    expect(authRedirectTarget(409, HERE)).toBeNull();
  });

  it("keeps the submission, navigates and throws RedirectingError on 401", async () => {
    const order: string[] = [];
    const navigate = vi.fn(() => {
      order.push("navigate");
    });
    const beforeRedirect = vi.fn(() => {
      order.push("save");
    });
    await expect(
      apiFetch("/api/x", undefined, {
        fetch: (async () => new Response("{}", { status: 401 })) as typeof fetch,
        href: () => HERE,
        navigate,
        beforeRedirect,
      })
    ).rejects.toBeInstanceOf(RedirectingError);
    expect(order).toEqual(["save", "navigate"]);
  });

  it("passes every other response through", async () => {
    const navigate = vi.fn();
    const res = await apiFetch("/api/x", undefined, {
      fetch: (async () => new Response("nope", { status: 404 })) as typeof fetch,
      href: () => HERE,
      navigate,
    });
    expect(res.status).toBe(404);
    expect(navigate).not.toHaveBeenCalled();
  });
});
