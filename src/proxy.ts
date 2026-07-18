import { NextResponse, type NextRequest } from "next/server";

// Optimistic auth gating: checks only that the session cookie exists (the API
// routes verify the session against the database on every request). Constant
// duplicated from src/lib/auth.ts because proxy code cannot import the
// database client.
const SESSION_COOKIE = "lingoduo_session";

export function proxy(request: NextRequest) {
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (!hasSession && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isAuthPage) {
    return NextResponse.redirect(new URL("/learn", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/learn",
    "/review/:path*",
    "/awards",
    "/profile",
    "/lesson/:path*",
    "/welcome",
    "/login",
    "/register",
  ],
};
