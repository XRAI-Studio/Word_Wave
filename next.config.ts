import type { NextConfig } from "next";

/** Class standard rule 2.4. HSTS is Vercel's default on the custom domain and is not redeclared. */
export const SECURITY_HEADERS = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

export const NEW_HOST = "https://wordwave.travelschooling.com";

/**
 * The old address. Hostinger still auto-deploys `master` to scottmacscott.com, so this
 * same build runs there and turns that instance into a redirector (work order criterion
 * 22). Config redirects run before `src/proxy.ts`, which stays byte-identical to Word
 * Power's, and need no database or environment.
 */
export const OLD_HOSTS = ["scottmacscott.com", "www.scottmacscott.com"];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
  async redirects() {
    return OLD_HOSTS.map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: `${NEW_HOST}/:path*`,
      permanent: true,
    }));
  },
};

export default nextConfig;
