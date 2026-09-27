/**
 * Every client call to Word Wave's own API goes through `apiFetch` (work order criterion
 * 21). API routes are outside the page gate and answer 401/403 themselves, so an access
 * token that expires while a page is open surfaces here: 401 sends the browser to the
 * portal login with this page as `next`, 403 to the portal's waiting page.
 */

import { leaveGuard } from "@/lib/leave-guard";

export const PORTAL = "https://class.travelschooling.com";

/** Thrown after navigation has started, so callers stop instead of showing an error. */
export class RedirectingError extends Error {
  constructor() {
    super("redirecting to the portal");
  }
}

export function authRedirectTarget(status: number, href: string): string | null {
  if (status === 401) return `${PORTAL}/login?next=${encodeURIComponent(href)}`;
  if (status === 403) return `${PORTAL}/waiting`;
  return null;
}

export interface ApiFetchOptions {
  /**
   * Runs just before the browser leaves for the portal, to keep the page's work (e.g. a
   * submission). Returns true when the work was kept: only then is the page let go
   * without the unsaved-work prompt (home-room plan, HR-004); otherwise the guard stays on.
   */
  beforeRedirect?: () => boolean;
  /** Lets the document leave without the prompt (the page's leave guard by default). */
  allowUnload?: () => void;
  navigate?: (url: string) => void;
  href?: () => string;
  fetch?: typeof fetch;
}

export async function apiFetch(input: string, init?: RequestInit, o: ApiFetchOptions = {}): Promise<Response> {
  const res = await (o.fetch ?? fetch)(input, init);
  const target = authRedirectTarget(res.status, (o.href ?? (() => window.location.href))());
  if (target) {
    if (o.beforeRedirect?.() === true) (o.allowUnload ?? (() => leaveGuard.allowUnload()))();
    (o.navigate ?? ((url: string) => window.location.assign(url)))(target);
    throw new RedirectingError();
  }
  return res;
}
