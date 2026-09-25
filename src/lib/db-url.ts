/**
 * The database URL for the by-hand tools (migrations, the seed, the course audit):
 * MIGRATE_DATABASE_URL when it is set to something, otherwise DATABASE_URL. Empty or
 * blank values count as unset, so the `.env.example` template's empty
 * MIGRATE_DATABASE_URL= line falls through to DATABASE_URL (WW-INSPECT-005/006). The app
 * itself always uses DATABASE_URL. Plain module: `prisma.config.ts` imports it.
 */
export function toolDatabaseUrl(env: Record<string, string | undefined> = process.env): string | undefined {
  const pick = (v: string | undefined) => (v && v.trim() ? v.trim() : undefined);
  return pick(env.MIGRATE_DATABASE_URL) ?? pick(env.DATABASE_URL);
}

/** Loads `.env` for a by-hand script; variables already set win (Node's loadEnvFile keeps them). */
export function loadLocalEnv(): void {
  try {
    process.loadEnvFile(".env");
  } catch {}
}
