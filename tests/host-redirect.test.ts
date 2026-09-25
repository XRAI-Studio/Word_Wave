import { describe, expect, it } from "vitest";
import nextConfig, { NEW_HOST, OLD_HOSTS } from "../next.config";

describe("scottmacscott.com redirect (work order criterion 22)", () => {
  it("sends both old hosts, every path, permanently to the new host", async () => {
    const rules = await nextConfig.redirects!();
    expect(OLD_HOSTS).toEqual(["scottmacscott.com", "www.scottmacscott.com"]);
    expect(NEW_HOST).toBe("https://wordwave.travelschooling.com");
    expect(rules).toEqual(
      OLD_HOSTS.map((host) => ({
        source: "/:path*",
        has: [{ type: "host", value: host }],
        destination: "https://wordwave.travelschooling.com/:path*",
        permanent: true,
      })),
    );
  });

  it("matches no other host, so the class itself is never redirected", async () => {
    const rules = await nextConfig.redirects!();
    for (const r of rules) expect(r.has?.[0]).toMatchObject({ type: "host" });
    expect(rules.map((r) => (r.has?.[0] as { value: string }).value)).not.toContain("wordwave.travelschooling.com");
  });
});
