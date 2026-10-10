/**
 * Reads the portal's Supabase session cookie the way the game kit does. Shared by
 * the API routes (which then verify the token) and by the browser, which only needs
 * to notice that the signed-in account changed under an open tab. Nothing here
 * verifies anything.
 */

function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  if (typeof Buffer !== "undefined") return Buffer.from(padded, "base64").toString("utf8");
  const bin = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/**
 * The project ref in a Supabase URL: the first label of its host, which is how
 * @supabase/ssr names its cookie (`sb-<ref>-auth-token`). Undefined without a usable URL.
 */
export function projectRef(supabaseUrl: string | undefined): string | undefined {
  if (!supabaseUrl) return undefined;
  try {
    return new URL(supabaseUrl).hostname.split(".")[0] || undefined;
  } catch {
    return undefined;
  }
}

type Chunk = { idx: number; val: string };

function tokenFrom(chunks: Chunk[]): string | null {
  chunks.sort((a, b) => a.idx - b.idx);
  try {
    let raw = decodeURIComponent(chunks.map((c) => c.val).join(""));
    if (raw.startsWith("base64-")) raw = b64urlDecode(raw.slice(7));
    const parsed = JSON.parse(raw) as { access_token?: unknown } | null;
    const token = parsed?.access_token;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

/**
 * Joins each project's numbered `sb-<ref>-auth-token` chunks, url-decodes, strips a
 * `base64-` prefix, parses JSON, and returns its `access_token`. Cookies from different
 * Supabase projects are read separately, never joined: `ref`'s cookie is tried first,
 * then the others by name, and the first that yields a token wins.
 */
export function extractAccessToken(cookieHeader: string | null, ref?: string): string | null {
  if (!cookieHeader) return null;
  const groups = new Map<string, Chunk[]>();
  for (const part of cookieHeader.split(/;\s*/)) {
    const m = part.match(/^sb-([^=]*)-auth-token(?:\.(\d+))?=(.*)$/);
    if (!m) continue;
    const chunks = groups.get(m[1]) ?? [];
    chunks.push({ idx: m[2] ? parseInt(m[2], 10) : 0, val: m[3] });
    groups.set(m[1], chunks);
  }
  const refs = [...groups.keys()].sort((a, b) => {
    if (a === ref) return -1;
    if (b === ref) return 1;
    return a < b ? -1 : a > b ? 1 : 0;
  });
  for (const r of refs) {
    const token = tokenFrom(groups.get(r)!);
    if (token) return token;
  }
  return null;
}

/** The `sub` claim of the session's access token, read without verification. */
export function sessionUserId(cookieHeader: string | null): string | null {
  const token = extractAccessToken(cookieHeader);
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(b64urlDecode(parts[1])) as { sub?: unknown };
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch {
    return null;
  }
}
