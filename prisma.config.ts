import path from "node:path";
import { defineConfig } from "prisma/config";

export const DB_FILE = path.join(__dirname, "prisma", "dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: `file:${DB_FILE}`,
  },
});
