import { describe, expect, it } from "vitest";
import { toolDatabaseUrl } from "@/lib/db-url";

describe("tool database URL (WW-INSPECT-005/006)", () => {
  it("prefers MIGRATE_DATABASE_URL for migrations, the seed and the audit", () => {
    expect(toolDatabaseUrl({ MIGRATE_DATABASE_URL: "postgres://prod", DATABASE_URL: "postgres://local" })).toBe("postgres://prod");
  });

  it("treats an empty or blank MIGRATE_DATABASE_URL as unset", () => {
    expect(toolDatabaseUrl({ MIGRATE_DATABASE_URL: "", DATABASE_URL: "postgres://local" })).toBe("postgres://local");
    expect(toolDatabaseUrl({ MIGRATE_DATABASE_URL: "  ", DATABASE_URL: "postgres://local" })).toBe("postgres://local");
  });

  it("is undefined when neither is set, so prisma generate needs no database", () => {
    expect(toolDatabaseUrl({})).toBeUndefined();
    expect(toolDatabaseUrl({ MIGRATE_DATABASE_URL: "", DATABASE_URL: "" })).toBeUndefined();
  });
});
