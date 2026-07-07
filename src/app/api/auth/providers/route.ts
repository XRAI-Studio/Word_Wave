import { NextResponse } from "next/server";

// Which optional login providers are configured (drives the Google button).
export async function GET() {
  return NextResponse.json({ google: Boolean(process.env.GOOGLE_CLIENT_ID) });
}
