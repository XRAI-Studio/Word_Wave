/** Environment checks shared by the server modules, free of Next and database imports. */

export interface SessionEnv {
  NODE_ENV?: string;
  NEXT_PUBLIC_TS_KIT?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
}

/** The dev mock session: the same condition `verifySession` uses for its bypass. Never production. */
export function isMockSession(env: SessionEnv = process.env): boolean {
  return env.NEXT_PUBLIC_TS_KIT === "mock" && env.NODE_ENV !== "production";
}
