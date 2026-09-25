import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

/** Every Word Wave table lives in this Postgres schema (work order criterion 3). */
export const DB_SCHEMA = "wordwave";

/**
 * Connections per client. `pg`'s default of 10 exhausts `prisma dev`'s limit of 10 as soon
 * as a second client (the seed, the e2e script) connects, and each Vercel instance needs
 * few: Supavisor's transaction pooler multiplexes them onto the database.
 */
export const POOL_MAX = 5;

/**
 * A Prisma client on node-postgres. Production passes the Supavisor transaction pooler
 * URL as `wordwave_app`; local development and e2e pass the `prisma dev` URL. Shared by
 * the app, `prisma/seed.ts`, `scripts/audit-courses.ts` and `scripts/e2e.ts`.
 */
export function createDbClient(url: string | undefined = process.env.DATABASE_URL, max = POOL_MAX): PrismaClient {
  if (!url) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url, max }, { schema: DB_SCHEMA }) });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function client(): PrismaClient {
  globalForPrisma.prisma ??= createDbClient();
  return globalForPrisma.prisma;
}

// Created on first use, not at import: `next build` imports route modules to collect
// their configuration, and a build (CI, or any host without a database) must not need
// DATABASE_URL.
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const c = client();
    const value = Reflect.get(c, prop, c);
    return typeof value === "function" ? value.bind(c) : value;
  },
});
