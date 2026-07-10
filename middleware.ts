import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/auth";

// Routes that don't require authentication
const PUBLIC_PATHS = ["/login", "/register", "/api/auth/login", "/api/auth/register", "/api/auth/me"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public paths and static assets
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // Check session cookie
  const token = req.cookies.get("meridian_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const session = await verifySession(token);
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // RBAC — admin-only routes
  const ADMIN_ONLY = ["/settings", "/api-keys", "/billing"];
  if (ADMIN_ONLY.some((p) => pathname.startsWith(p)) && session.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
