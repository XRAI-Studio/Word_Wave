import path from "node:path";
import { defineConfig } from "prisma/config";
import { resolveDbPath } from "./src/lib/db-path";

export const DB_FILE = resolveDbPath(process.env.DATABASE_PATH, path.join(__dirname, "prisma", "dev.db"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "npx -y tsx prisma/seed.ts",
  },
  datasource: {
    url: `file:${DB_FILE}`,
  },
});
