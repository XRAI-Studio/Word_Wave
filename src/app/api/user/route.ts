import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { getUserState } from "@/lib/user-service";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }
  return NextResponse.json(await getUserState(sessionUser.id));
}
