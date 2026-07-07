import { NextResponse } from "next/server";
import { getLocalUser } from "@/lib/user-service";

export async function GET() {
  const user = await getLocalUser();
  return NextResponse.json(user);
}
