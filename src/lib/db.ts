import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // DATABASE_PATH lets production (Hostinger) keep the SQLite file at a
  // persistent location outside the deploy directory.
  const dbFile = process.env.DATABASE_PATH
    ? path.resolve(process.env.DATABASE_PATH)
    : path.join(process.cwd(), "prisma", "dev.db");
  return new PrismaClient({ adapter: new PrismaBetterSqlite3({ url: `file:${dbFile}` }) });
}

export const db = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
