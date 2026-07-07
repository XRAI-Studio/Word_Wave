import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSession } from "@/lib/auth";
import { db } from "@/lib/db";

// Google redirects here with ?code&state. Exchange the code, fetch the
// profile, find-or-create the user, and start a session.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const appUrl = process.env.APP_URL ?? url.origin;
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/login?error=${reason}`, appUrl));

  const cookieStore = await cookies();
  const expectedState = cookieStore.get("lingoduo_oauth_state")?.value;
  cookieStore.delete("lingoduo_oauth_state");

  if (!code || !state || !expectedState || state !== expectedState) {
    return fail("google-state");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("google-not-configured");

  // Exchange the authorization code for tokens.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return fail("google-token");
  const tokens = (await tokenRes.json()) as { access_token?: string };
  if (!tokens.access_token) return fail("google-token");

  // Fetch the Google profile.
  const profileRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  if (!profileRes.ok) return fail("google-profile");
  const profile = (await profileRes.json()) as {
    sub: string;
    email?: string;
    name?: string;
  };
  if (!profile.sub) return fail("google-profile");

  const email = profile.email?.toLowerCase();

  // Match by googleId first, then link an existing email account, else create.
  let user = await db.user.findUnique({ where: { googleId: profile.sub } });
  if (!user && email) {
    const byEmail = await db.user.findUnique({ where: { email } });
    if (byEmail) {
      user = await db.user.update({
        where: { id: byEmail.id },
        data: { googleId: profile.sub },
      });
    }
  }
  if (!user) {
    user = await db.user.create({
      data: {
        googleId: profile.sub,
        email,
        displayName: profile.name ?? email ?? "Learner",
      },
    });
  }

  await createSession(user.id);
  return NextResponse.redirect(new URL("/learn", appUrl));
}
