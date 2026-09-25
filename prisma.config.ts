import { defineConfig } from "prisma/config";

// Prisma 7 no longer reads `.env` itself. Load it when present (local development);
// CI, Vercel and a by-hand production run pass real environment variables instead.
try {
  process.loadEnvFile(".env");
} catch {}

// Migrations and the seed run by hand, never at build time. Against production they use
// the session pooler (MIGRATE_DATABASE_URL, see README "Deploy"); locally the one
// DATABASE_URL serves both. `prisma generate` needs neither, so CI and builds work with
// no database configured.
const url = process.env.MIGRATE_DATABASE_URL ?? process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx -y tsx prisma/seed.ts",
  },
  ...(url ? { datasource: { url: withSchema(url) } } : {}),
});

/** Every Word Wave table lives in schema `wordwave` (work order criterion 3). */
function withSchema(raw: string): string {
  const u = new URL(raw);
  u.searchParams.set("schema", "wordwave");
  return u.toString();
}
