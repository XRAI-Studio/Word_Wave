import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Kick off the Google OAuth code flow: remember a state nonce in a short-lived
// cookie and send the browser to Google's consent screen.
export async function GET(req: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google-not-configured", req.url));
  }

  const appUrl = process.env.APP_URL ?? new URL(req.url).origin;
  const state = randomBytes(16).toString("hex");

  const cookieStore = await cookies();
  cookieStore.set("lingoduo_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", `${appUrl}/api/auth/google/callback`);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl);
}
