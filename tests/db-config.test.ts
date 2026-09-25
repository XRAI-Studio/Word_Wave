import { describe, expect, it } from "vitest";
import { connectionConfig } from "@/lib/db";
import { SUPABASE_ROOT_CA } from "@/lib/supabase-ca";

describe("database TLS (verified, never disabled)", () => {
  it("verifies Supabase pooler connections against the pinned Supabase root", () => {
    const c = connectionConfig("postgres://wordwave_app.ref:pw@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require");
    expect(c.ssl).toEqual({ ca: SUPABASE_ROOT_CA, rejectUnauthorized: true });
    expect(c.connectionString).not.toContain("sslmode");
    expect(c.connectionString).toContain("aws-0-us-east-1.pooler.supabase.com:6543");
  });

  it("leaves a local database URL untouched", () => {
    const url = "postgres://postgres:postgres@localhost:51214/template1?sslmode=disable";
    expect(connectionConfig(url)).toEqual({ connectionString: url });
  });

  it("pins the Supabase Root 2021 CA", () => {
    expect(SUPABASE_ROOT_CA.startsWith("-----BEGIN CERTIFICATE-----")).toBe(true);
    expect(SUPABASE_ROOT_CA.trim().endsWith("-----END CERTIFICATE-----")).toBe(true);
  });
});
